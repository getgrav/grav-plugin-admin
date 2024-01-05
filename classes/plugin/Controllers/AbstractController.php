<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2024 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

declare(strict_types=1);

namespace Grav\Plugin\Admin\Controllers;

use Grav\Common\Debugger;
use Grav\Common\Grav;
use Grav\Common\Inflector;
use Grav\Common\Language\Language;
use Grav\Common\Utils;
use Grav\Framework\Flex\Interfaces\FlexObjectInterface;
use Grav\Framework\Form\Interfaces\FormInterface;
use Grav\Framework\Psr7\Response;
use Grav\Framework\RequestHandler\Exception\NotFoundException;
use Grav\Framework\RequestHandler\Exception\PageExpiredException;
use Grav\Framework\RequestHandler\Exception\RequestException;
use Grav\Framework\Route\Route;
use Grav\Framework\Session\SessionInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use RocketTheme\Toolbox\Event\Event;
use RocketTheme\Toolbox\Session\Message;

abstract class AbstractController implements RequestHandlerInterface
{
    /** @var string */
    protected $nonce_action = 'admin-form';

    /** @var string */
    protected $nonce_name = 'admin-nonce';

    /** @var ServerRequestInterface */
    protected $request;

    /** @var Grav */
    protected $grav;

    /** @var string */
    protected $type;

    /** @var string */
    protected $key;

    /**
     * Handle request.
     *
     * Fires event: admin.[directory].[task|action].[command]
     *
     * @param ServerRequestInterface $request
     * @return Response
     */
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $attributes = $request->getAttributes();
        $this->request = $request;
        $this->grav = $attributes['grav'] ?? Grav::instance();
        $this->type =  $attributes['type'] ?? null;
        $this->key =  $attributes['key'] ?? null;

        /** @var Route $route */
        $route = $attributes['route'];
        $post = $this->getPost();

        if ($this->isFormSubmit()) {
            $form = $this->getForm();
            $this->nonce_name = $attributes['nonce_name'] ?? $form->getNonceName();
            $this->nonce_action = $attributes['nonce_action'] ?? $form->getNonceAction();
        }

        try {
            $task = $request->getAttribute('task') ?? $post['task'] ?? $route->getParam('task');
            if ($task) {
                if (empty($attributes['forwarded'])) {
                    $this->checkNonce($task);
                }
                $type = 'task';
                $command = $task;
            } else {
                $type = 'action';
                $command = $request->getAttribute('action') ?? $post['action'] ?? $route->getParam('action') ?? 'display';
            }
            $command = strtolower($command);

            $event = new Event(
                [
                    'controller' => $this,
                    'response' => null
                ]
            );

            $this->grav->fireEvent("admin.{$this->type}.{$type}.{$command}", $event);

            $response = $event['response'];
            if (!$response) {
                /** @var Inflector $inflector */
                $inflector = $this->grav['inflector'];
                $method = $type . $inflector::camelize($command);
                if ($method && method_exists($this, $method)) {
                    $response = $this->{$method}($request);
                } else {
                    throw new NotFoundException($request);
                }
            }
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $response = $this->createErrorResponse($e);
        }

        if ($response instanceof Response) {
            return $response;
        }

        return $this->createJsonResponse($response);
    }

    /**
     * Get request.
     *
     * @return ServerRequestInterface
     */
    public function getRequest(): ServerRequestInterface
    {
        return $this->request;
    }

    /**
     * @param string|null $name
     * @param mixed $default
     * @return mixed
     */
    public function getPost(string $name = null, $default = null)
    {
        $body = $this->request->getParsedBody();

        if ($name) {
            return $body[$name] ?? $default;
        }

        return $body;
    }

    /**
     * Check if a form has been submitted.
     *
     * @return bool
     */
    public function isFormSubmit(): bool
    {
        return (bool)$this->getPost('__form-name__');
    }

    /**
     * Get form.
     *
     * @param string|null $type
     * @return FormInterface
     */
    public function getForm(string $type = null): FormInterface
    {
        $object = $this->getObject();
        if (!$object) {
            throw new \RuntimeException('Not Found', 404);
        }

        $formName = $this->getPost('__form-name__');
        $uniqueId = $this->getPost('__unique_form_id__') ?: $formName;

        $form = $object->getForm($type ?? 'edit');
        if ($uniqueId) {
            $form->setUniqueId($uniqueId);
        }

        return $form;
    }

    /**
     * @return FlexObjectInterface
     */
    abstract public function getObject();

    /**
     * Get Grav instance.
     *
     * @return Grav
     */
    public function getGrav(): Grav
    {
        return $this->grav;
    }

    /**
     * Get session.
     *
     * @return SessionInterface
     */
    public function getSession(): SessionInterface
    {
        return $this->getGrav()['session'];
    }

    /**
     * Display the current admin page.
     *
     * @return Response
     */
    public function createDisplayResponse(): ResponseInterface
    {
        return new Response(418);
    }

    /**
     * Create custom HTML response.
     *
     * @param string $content
     * @param int $code
     * @return Response
     */
    public function createHtmlResponse(string $content, int $code = null): ResponseInterface
    {
        return new Response($code ?: 200, [], $content);
    }

    /**
     * Create JSON response.
     *
     * @param array $content
     * @return Response
     */
    public function createJsonResponse(array $content): ResponseInterface
    {
        $code = $content['code'] ?? 200;
        if ($code >= 301 && $code <= 307) {
            $code = 200;
        }

        return new Response($code, ['Content-Type' => 'application/json'], json_encode($content));
    }

    /**
     * Create redirect response.
     *
     * @param string $url
     * @param int $code
     * @return Response
     */
    public function createRedirectResponse(string $url, int $code = null): ResponseInterface
    {
        if (null === $code || $code < 301 || $code > 307) {
            $code = $this->grav['config']->get('system.pages.redirect_default_code', 302);
        }

        $accept = $this->getAccept(['application/json', 'text/html']);

        if ($accept === 'application/json') {
            return $this->createJsonResponse(['code' => $code, 'status' => 'redirect', 'redirect' => $url]);
        }

        return new Response($code, ['Location' => $url]);
    }

    /**
     * Create error response.
     *
     * @param  \Exception $exception
     * @return Response
     */
    public function createErrorResponse(\Exception $exception): ResponseInterface
    {
        $validCodes = [
            400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418,
            422, 423, 424, 425, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 511
        ];

        if ($exception instanceof RequestException) {
            $code = $exception->getHttpCode();
            $reason = $exception->getHttpReason();
        } else {
            $code = $exception->getCode();
            $reason = null;
        }

        if (!in_array($code, $validCodes, true)) {
            $code = 500;
        }

        $message = $exception->getMessage();
        $response = [
            'code' => $code,
            'status' => 'error',
            'message' => htmlspecialchars($message, ENT_QUOTES | ENT_HTML5, 'UTF-8')
        ];

        $accept = $this->getAccept(['application/json', 'text/html']);

        if ($accept === 'text/html') {
            $method = $this->getRequest()->getMethod();

            // On POST etc, redirect back to the previous page.
            if ($method !== 'GET' && $method !== 'HEAD') {
                $this->setMessage($message, 'error');
                $referer = $this->request->getHeaderLine('Referer');
                return $this->createRedirectResponse($referer, 303);
            }

            // TODO: improve error page
            return $this->createHtmlResponse($response['message']);
        }

        return new Response($code, ['Content-Type' => 'application/json'], json_encode($response), '1.1', $reason);
    }

    /**
     * Translate a string.
     *
     * @param  string $string
     * @return string
     */
    public function translate(string $string): string
    {
        /** @var Language $language */
        $language = $this->grav['language'];

        return $language->translate($string);
    }

    /**
     * Set message to be shown in the admin.
     *
     * @param  string $message
     * @param  string $type
     * @return $this
     */
    public function setMessage($message, $type = 'info')
    {
        /** @var Message $messages */
        $messages = $this->grav['messages'];
        $messages->add($message, $type);

        return $this;
    }

    /**
     * Check if request nonce is valid.
     *
     * @param  string $task
     * @throws PageExpiredException  If nonce is not valid.
     */
    protected function checkNonce(string $task): void
    {
        $nonce = null;

        if (\in_array(strtoupper($this->request->getMethod()), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $nonce = $this->getPost($this->nonce_name);
        }

        if (!$nonce) {
            $nonce = $this->grav['uri']->param($this->nonce_name);
        }

        if (!$nonce) {
            $nonce = $this->grav['uri']->query($this->nonce_name);
        }

        if (!$nonce || !Utils::verifyNonce($nonce, $this->nonce_action)) {
            throw new PageExpiredException($this->request);
        }
    }

    /**
     * Return the best matching mime type for the request.
     *
     * @param  string[] $compare
     * @return string|null
     */
    protected function getAccept(array $compare): ?string
    {
        $accepted = [];
        foreach ($this->request->getHeader('Accept') as $accept) {
            foreach (explode(',', $accept) as $item) {
                if (!$item) {
                    continue;
                }

                $split = explode(';q=', $item);
                $mime = array_shift($split);
                $priority = array_shift($split) ?? 1.0;

                $accepted[$mime] = $priority;
            }
        }

        arsort($accepted);

        // TODO: add support for image/* etc
        $list = array_intersect($compare, array_keys($accepted));
        if (!$list && (isset($accepted['*/*']) || isset($accepted['*']))) {
            return reset($compare) ?: null;
        }

        return reset($list) ?: null;
    }
}
