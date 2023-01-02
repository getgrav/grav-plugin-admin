<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2023 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin;

use Grav\Common\Grav;
use Grav\Common\Processors\ProcessorBase;
use Grav\Framework\Route\Route;
use Grav\Plugin\Admin\Routers\LoginRouter;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class Router extends ProcessorBase
{
    public $id = 'admin_router';
    public $title = 'Admin Panel';

    /** @var Admin */
    protected $admin;

    public function __construct(Grav $container, Admin $admin)
    {
        parent::__construct($container);

        $this->admin = $admin;
    }

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
        $query = $request->getQueryParams();

        /** @var Route $route */
        $route = $context['route'];
        $normalized = mb_strtolower(trim($route->getRoute(), '/'));
        $parts = explode('/', $normalized);
        array_shift($parts); // Admin path
        $routeStr = implode('/', $parts);
        $view = array_shift($parts);
        $path = implode('/', $parts);
        $task = $this->container['task'] ?? $query['task'] ?? null;
        $action = $this->container['action'] ?? $query['action'] ?? null;

        $params = ['view' => $view, 'route' => $routeStr, 'path' => $path, 'parts' => $parts, 'task' => $task, 'action' => $action];
        $request = $request->withAttribute('admin', $params);

        // Run login controller if user isn't fully logged in or asks to logout.
        $user = $this->admin->user;
        if (!$user->authorized || !$user->authorize('admin.login')) {
            $params = (new LoginRouter())->matchServerRequest($request);
            $request = $request->withAttribute('admin', $params + $request->getAttribute('admin'));
        }

        $this->admin->request = $request;

        $response = $handler->handle($request);

        $this->stopTimer();

        // Never allow admin pages to be rendered in <frame>, <iframe>, <embed> or <object> for improved security.
        return $response->withHeader('X-Frame-Options', 'DENY');
    }
}
