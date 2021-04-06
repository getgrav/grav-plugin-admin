<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2021 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin\Routers;

use Grav\Plugin\Admin\Admin;
use Grav\Plugin\Admin\Controllers\Login\LoginController;
use Psr\Http\Message\ServerRequestInterface;

class LoginRouter
{
    /** @var string[] */
    private $taskTemplates = [
        'logout' => 'login',
        'twofa' => 'login',
        'forgot' => 'forgot',
        'reset' => 'reset'
    ];

    /**
     * @param ServerRequestInterface $request
     * @return array
     */
    public function matchServerRequest(ServerRequestInterface $request): array
    {
        $adminInfo = $request->getAttribute('admin');
        $task = $adminInfo['task'];
        $class = LoginController::class;

        // Special controller for the new sites.
        if (!Admin::doAnyUsersExist()) {
            $method = $task === 'register' ? 'taskRegister' : 'displayRegister';

            return [
                'controller' => [
                    'class' => $class,
                    'method' => $method,
                    'params' => []
                ],
                'template' => 'register',
            ];
        }

        $httpMethod = $request->getMethod();
        $template = $this->taskTemplates[$task] ?? $adminInfo['view'];
        $params = [];

        switch ($template) {
            case 'forgot':
                break;
            case 'reset':
                $path = $adminInfo['path'];
                if (str_starts_with($path, 'u/')) {
                    // Path is 'u/username/token'
                    $parts = explode('/', $path, 4);
                    $user = $parts[1] ?? null;
                    $token = $parts[2] ?? null;
                } else {
                    // Old path used to be 'task:reset/user:username/token:token'
                    if ($httpMethod === 'GET' || $httpMethod === 'HEAD') {
                        $task = null;
                    }
                    $route = $request->getAttribute('route');
                    $user  = $route->getGravParam('user');
                    $token = $route->getGravParam('token');
                }
                $params = [$user, $token];
                break;
            default:
                $template = 'login';
        }

        $method = ($task ? 'task' : 'display') . ucfirst($task ?? $template);
        if (!method_exists($class, $method)) {
            $method = 'displayUnauthorized';
        }

        return [
            'controller' => [
                'class' => $class,
                'method' => $method,
                'params' => $params
            ],
            'template' => $template,
        ];
    }
}
