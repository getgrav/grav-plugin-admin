<?php

namespace Grav\Plugin\Admin;

use Grav\Common\Processors\ProcessorBase;
use Grav\Framework\Route\Route;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class Router extends ProcessorBase
{
    public $id = 'admin_router';
    public $title = 'Admin Panel';

    /**
     * Handle routing to the dashboard, group and build objects.
     *
     * @param ServerRequestInterface $request
     * @param RequestHandlerInterface $handler
     * @return ResponseInterface
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler) : ResponseInterface
    {
        $this->startTimer();

        $context = $request->getAttributes();

        /** @var Route $route */
        $route = $context['route'];
        $normalized = mb_strtolower(trim($route->getRoute(), '/'));
        $parts = explode('/', $normalized);
        array_shift($parts);
        $key = array_shift($parts);
        $path = implode('/', $parts);

        $request = $request->withAttribute('admin', ['path' => $path, 'parts' => $parts]);

        $response = null;
        /*
        if ($key === '__TODO__') {

            $controller = new TodoController();

            $response = $controller->handle($request);
        }
        */

        if (!$response) {
            // Fallback to the old admin behavior.
            $response = $handler->handle($request);
        }

        $this->stopTimer();

        // Never allow admin pages to be rendered in <frame>, <iframe>, <embed> or <object> for improved security.
        return $response->withHeader('X-Frame-Options', 'NONE');
    }
}
