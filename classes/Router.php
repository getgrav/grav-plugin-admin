<?php

namespace Grav\Plugin\Admin;

use Grav\Common\Processors\ProcessorBase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class Router extends ProcessorBase
{
    public $id = 'admin_router';
    public $title = 'Admin Panel';

    /**
     * Admin router.
     *
     * @param ServerRequestInterface $request
     * @param RequestHandlerInterface $handler
     * @return ResponseInterface
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler) : ResponseInterface
    {
        $this->startTimer();
        $response = $handler->handle($request);
        $this->stopTimer();

        // Never allow admin pages to be rendered in <frame>, <iframe>, <embed> or <object> for improved security.
        return $response->withHeader('X-Frame-Options', 'NONE');
    }
}
