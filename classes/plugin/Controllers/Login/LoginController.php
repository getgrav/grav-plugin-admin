<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2021 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin\Controllers\Login;

use Grav\Common\Debugger;
use Grav\Common\Grav;
use Grav\Common\Page\Pages;
use Grav\Common\Uri;
use Grav\Common\User\Interfaces\UserCollectionInterface;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Framework\RequestHandler\Exception\PageExpiredException;
use Grav\Framework\RequestHandler\Exception\RequestException;
use Grav\Plugin\Admin\Admin;
use Grav\Plugin\Admin\Controllers\AdminController;
use Grav\Plugin\Email\Email;
use Grav\Plugin\Login\Login;
use Psr\Http\Message\ResponseInterface;
use RobThree\Auth\TwoFactorAuthException;

/**
 * Class LoginController
 * @package Grav\Plugin\Admin\Controllers\Login
 */
class LoginController extends AdminController
{
    /** @var string */
    protected $nonce_action = 'admin-login';
    /** @var string */
    protected $nonce_name = 'login-nonce';

    /**
     * @return ResponseInterface
     */
    public function displayLogin(): ResponseInterface
    {
        $this->page = $this->createPage('login');

        $user = $this->getUser();
        if ($this->is2FA($user)) {
            $this->form = $this->getForm('login-twofa', ['reset' => true]);
        } else {
            $this->form = $this->getForm('login', ['reset' => true]);
        }

        return $this->createDisplayResponse();
    }

    /**
     * @return ResponseInterface
     */
    public function displayForgot(): ResponseInterface
    {
        $this->page = $this->createPage('forgot');
        $this->form = $this->getForm('admin-login-forgot', ['reset' => true]);

        return $this->createDisplayResponse();
    }

    /**
     * Handle the reset password action.
     *
     * @param string|null $username
     * @param string|null $token
     * @return ResponseInterface
     */
    public function displayReset(string $username = null, string $token = null): ResponseInterface
    {
        if ('' === (string)$username || '' === (string)$token) {
            $this->setMessage($this->translate('PLUGIN_ADMIN.RESET_INVALID_LINK'), 'error');

            return $this->createRedirectResponse('/forgot');
        }

        $this->page = $this->createPage('reset');
        $this->form = $this->getForm('admin-login-reset', ['reset' => true]);
        $this->form->setData('username', $username);
        $this->form->setData('token', $token);

        $this->setMessage($this->translate('PLUGIN_ADMIN.RESET_NEW_PASSWORD'));

        return $this->createDisplayResponse();
    }

    /**
     * @return ResponseInterface
     */
    public function displayRegister(): ResponseInterface
    {
        $route = $this->getRequest()->getAttribute('admin')['route'] ?? '';
        if ('' !== $route) {
            return $this->createRedirectResponse('/');
        }

        $this->page = $this->createPage('register');
        $this->form = $this->getForm('admin-login-register');

        return $this->createDisplayResponse();
    }

    /**
     * @return ResponseInterface
     */
    public function displayUnauthorized(): ResponseInterface
    {
        $uri = (string)$this->getRequest()->getUri();

        $ext = pathinfo($uri, PATHINFO_EXTENSION);
        $accept = $this->getAccept(['application/json', 'text/html']);
        if ($ext === 'json' || $accept === 'application/json') {
            return $this->createErrorResponse(new RequestException($this->getRequest(), $this->translate('PLUGIN_ADMIN.LOGGED_OUT'), 401));
        }

        $this->setMessage($this->translate('PLUGIN_ADMIN.LOGGED_OUT'), 'warning');

        return $this->createRedirectResponse('/');
    }

    /**
     * Handle login.
     *
     * @return ResponseInterface
     */
    public function taskLogin(): ResponseInterface
    {
        $this->page = $this->createPage('login');
        $this->form = $this->getActiveForm() ?? $this->getForm('login');
        try {
            $this->checkNonce();
        } catch (PageExpiredException $e) {
            $this->setMessage($this->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'), 'error');

            return $this->createDisplayResponse();
        }

        $post = $this->getPost();
        $credentials = (array)($post['data'] ?? []);
        $login = $this->getLogin();
        $config = $this->getConfig();

        $userKey = (string)($credentials['username'] ?? '');
        // Pseudonymization of the IP.
        $ipKey = sha1(Uri::ip() . $config->get('security.salt'));

        $rateLimiter = $login->getRateLimiter('login_attempts');

        // Check if the current IP has been used in failed login attempts.
        $attempts = count($rateLimiter->getAttempts($ipKey, 'ip'));

        $rateLimiter->registerRateLimitedAction($ipKey, 'ip')->registerRateLimitedAction($userKey);

        // Check rate limit for both IP and user, but allow each IP a single try even if user is already rate limited.
        if ($rateLimiter->isRateLimited($ipKey, 'ip') || ($attempts && $rateLimiter->isRateLimited($userKey))) {
            Admin::DEBUG && Admin::addDebugMessage('Admin login: rate limit, redirecting', $credentials);

            $this->setMessage($this->translate('PLUGIN_LOGIN.TOO_MANY_LOGIN_ATTEMPTS', $rateLimiter->getInterval()), 'error');

            $this->form->reset();

            /** @var Pages $pages */
            $pages = $this->grav['pages'];

            // Redirect to the home page of the site.
            return $this->createRedirectResponse($pages->homeUrl(null, true));
        }

        Admin::DEBUG && Admin::addDebugMessage('Admin login', $credentials);

        // Fire Login process.
        $event = $login->login(
            $credentials,
            ['admin' => true, 'twofa' => $config->get('plugins.admin.twofa_enabled', false)],
            ['authorize' => 'admin.login', 'return_event' => true]
        );
        $user = $event->getUser();

        Admin::DEBUG && Admin::addDebugMessage('Admin login: user', $user);

        $redirect = (string)$this->getRequest()->getUri();

        if ($user->authenticated) {
            $rateLimiter->resetRateLimit($ipKey, 'ip')->resetRateLimit($userKey);
            if ($user->authorized) {
                $event->defMessage('PLUGIN_ADMIN.LOGIN_LOGGED_IN', 'info');
            }

            $event->defRedirect($redirect);
        } elseif ($user->authorized) {
            $event->defMessage('PLUGIN_LOGIN.ACCESS_DENIED', 'error');
        } else {
            $event->defMessage('PLUGIN_LOGIN.LOGIN_FAILED', 'error');
        }

        $event->defRedirect($redirect);

        $message = $event->getMessage();
        if ($message) {
            $this->setMessage($this->translate($message), $event->getMessageType());
        }

        $this->form->reset();

        return $this->createRedirectResponse($event->getRedirect());
    }

    /**
     * Handle logout when user isn't fully logged in or clicks logout after the session has been expired.
     *
     * @return ResponseInterface
     */
    public function taskLogout(): ResponseInterface
    {
        // We do not need to check the nonce here as user session has been expired or user hasn't fully logged in (2FA).
        // Just be sure we terminate the current session.
        $login = $this->getLogin();
        $event = $login->logout(['admin' => true], ['return_event' => true]);

        $event->defMessage('PLUGIN_ADMIN.LOGGED_OUT', 'info');
        $message = $event->getMessage();
        if ($message) {
            $this->getSession()->setFlashCookieObject(Admin::TMP_COOKIE_NAME, ['message' => $this->translate($message), 'status' => $event->getMessageType()]);
        }

        return $this->createRedirectResponse('/');
    }

    /**
     * Handle 2FA verification.
     *
     * @return ResponseInterface
     */
    public function taskTwofa(): ResponseInterface
    {
        $user = $this->getUser();
        if (!$this->is2FA($user)) {
            Admin::DEBUG && Admin::addDebugMessage('Admin login: user is not logged in or does not have 2FA enabled', $user);

            // Task is visible only for users who have enabled 2FA.
            return $this->createRedirectResponse('/');
        }

        $login = $this->getLogin();

        $this->page = $this->createPage('login');
        $this->form = $this->getForm('login-twofa');
        try {
            $this->checkNonce();
        } catch (PageExpiredException $e) {
            $this->setMessage($this->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'), 'error');

            // Failed 2FA nonce check, logout and redirect.
            $login->logout(['admin' => true]);
            $this->form->reset();

            return $this->createRedirectResponse('/');
        }


        $post = $this->getPost();
        $data = $post['data'] ?? [];

        try {
            $twoFa = $login->twoFactorAuth();
        } catch (TwoFactorAuthException $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $twoFa = null;
        }

        $code = $data['2fa_code'] ?? null;
        $secret = $user->twofa_secret ?? null;
        $redirect = (string)$this->getRequest()->getUri();

        if (null === $twoFa || !$user->authenticated || !$code || !$secret || !$twoFa->verifyCode($secret, $code)) {
            Admin::DEBUG && Admin::addDebugMessage('Admin login: 2FA check failed, log out!');

            // Failed 2FA auth, logout and redirect to the current page.
            $login->logout(['admin' => true]);

            $this->grav['session']->setFlashCookieObject(Admin::TMP_COOKIE_NAME, ['message' => $this->translate('PLUGIN_ADMIN.2FA_FAILED'), 'status' => 'error']);

            $this->form->reset();

            return $this->createRedirectResponse($redirect);
        }

        // Successful 2FA, authorize user and redirect.
        Grav::instance()['user']->authorized = true;

        Admin::DEBUG && Admin::addDebugMessage('Admin login: 2FA check succeeded, authorize user and redirect');

        $this->setMessage($this->translate('PLUGIN_ADMIN.LOGIN_LOGGED_IN'));

        $this->form->reset();

        return $this->createRedirectResponse($redirect);
    }

    /**
     * Handle the reset password action.
     *
     * @param string|null $username
     * @param string|null $token
     * @return ResponseInterface
     */
    public function taskReset(string $username = null, string $token = null): ResponseInterface
    {
        $this->page = $this->createPage('reset');
        $this->form = $this->getForm('admin-login-reset');
        try {
            $this->checkNonce();
        } catch (PageExpiredException $e) {
            $this->setMessage($this->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'), 'error');

            return $this->createDisplayResponse();
        }


        $post = $this->getPost();
        $data = $post['data'] ?? [];
        $users = $this->getAccounts();

        $username = $username ?? $data['username'] ?? null;
        $token = $token ?? $data['token'] ?? null;

        $user = $username ? $users->load($username) : null;
        $password = $data['password'];

        if ($user && $user->exists() && !empty($user->get('reset'))) {
            [$good_token, $expire] = explode('::', $user->get('reset'));

            if ($good_token === $token) {
                if (time() > $expire) {
                    $this->setMessage($this->translate('PLUGIN_ADMIN.RESET_LINK_EXPIRED'), 'error');

                    $this->form->reset();

                    return $this->createRedirectResponse('/forgot');
                }

                // Set new password.
                $login = $this->getLogin();
                try {
                    $login->validateField('password1', $password);
                } catch (\RuntimeException $e) {
                    $this->setMessage($this->translate($e->getMessage()), 'error');

                    return $this->createRedirectResponse("/reset/u/{$username}/{$token}");
                }

                $user->undef('hashed_password');
                $user->undef('reset');
                $user->update(['password' => $password]);
                $user->save();

                $this->form->reset();

                $this->setMessage($this->translate('PLUGIN_ADMIN.RESET_PASSWORD_RESET'));

                return $this->createRedirectResponse('/login');
            }

            Admin::DEBUG && Admin::addDebugMessage(sprintf('Failed to reset password: Token %s is not good', $token));
        } else {
            Admin::DEBUG && Admin::addDebugMessage(sprintf('Failed to reset password: User %s does not exist or has not requested reset', $username));
        }

        $this->setMessage($this->translate('PLUGIN_ADMIN.RESET_INVALID_LINK'), 'error');

        $this->form->reset();

        return $this->createRedirectResponse('/forgot');
    }

    /**
     * Handle the email password recovery procedure.
     *
     * Sends email to the user.
     *
     * @return ResponseInterface
     */
    public function taskForgot(): ResponseInterface
    {
        $this->page = $this->createPage('forgot');
        $this->form = $this->getForm('admin-login-forgot');
        try {
            $this->checkNonce();
        } catch (PageExpiredException $e) {
            $this->setMessage($this->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'), 'error');

            return $this->createDisplayResponse();
        }


        $post = $this->getPost();
        $data = $post['data'] ?? [];
        $login = $this->getLogin();
        $users = $this->getAccounts();
        $email = $this->getEmail();

        $current = (string)$this->getRequest()->getUri();

        $search = isset($data['username']) ? strip_tags($data['username']) : '';
        $user = !empty($search) ? $users->load($search) : null;
        $username = $user->username ?? null;
        $to = $user->email ?? null;

        // Only send email to users which are enabled and have an email address.
        if (null === $user || $user->state !== 'enabled' || !$to) {
            Admin::DEBUG && Admin::addDebugMessage(sprintf('Failed sending email: %s <%s> was not found or is blocked', $search, $to ?? 'N/A'));

            $this->form->reset();

            $this->setMessage($this->translate('PLUGIN_ADMIN.FORGOT_INSTRUCTIONS_SENT_VIA_EMAIL'));

            return $this->createRedirectResponse($current);
        }

        $config = $this->getConfig();

        // Check rate limit for the user.
        $rateLimiter = $login->getRateLimiter('pw_resets');
        $rateLimiter->registerRateLimitedAction($username);
        if ($rateLimiter->isRateLimited($username)) {
            Admin::DEBUG && Admin::addDebugMessage(sprintf('Failed sending email: user %s <%s> is rate limited', $search, $to));

            $this->form->reset();

            $interval = $config->get('plugins.login.max_pw_resets_interval', 2);

            $this->setMessage($this->translate('PLUGIN_LOGIN.FORGOT_CANNOT_RESET_IT_IS_BLOCKED', $to, $interval), 'error');

            return $this->createRedirectResponse($current);
        }

        $token  = md5(uniqid(mt_rand(), true));
        $expire = time() + 3600; // 1 hour

        $user->set('reset', $token . '::' . $expire);
        $user->save();

        $from = $config->get('plugins.email.from');
        if (empty($from)) {
            Admin::DEBUG && Admin::addDebugMessage('Failed sending email: from address is not configured in email plugin');

            $this->form->reset();

            $this->setMessage($this->translate('PLUGIN_ADMIN.FORGOT_EMAIL_NOT_CONFIGURED'), 'error');

            return $this->createRedirectResponse($current);
        }

        // Do not trust username from the request.
        $fullname = $user->fullname ?: $username;
        $author = $config->get('site.author.name', '');
        $sitename = $config->get('site.title', 'Website');
        $reset_link = $this->getAbsoluteAdminUrl("/reset/u/{$username}/{$token}");

        // For testing only!
        //Admin::DEBUG && Admin::addDebugMessage(sprintf('Reset link: %s', $reset_link));

        $subject = $this->translate('PLUGIN_ADMIN.FORGOT_EMAIL_SUBJECT', $sitename);
        $content = $this->translate('PLUGIN_ADMIN.FORGOT_EMAIL_BODY', $fullname, $reset_link, $author, $sitename);

        $this->grav['twig']->init();
        $body = $this->grav['twig']->processTemplate('email/base.html.twig', ['content' => $content]);

        try {
            $message = $email->message($subject, $body, 'text/html')->setFrom($from)->setTo($to);
            $sent = $email->send($message);
            if ($sent < 1) {
                throw new \RuntimeException('Sending email failed');
            }

            // For testing only!
            //Admin::DEBUG && Admin::addDebugMessage(sprintf('Email sent to %s', $to), $body);

            $this->setMessage($this->translate('PLUGIN_ADMIN.FORGOT_INSTRUCTIONS_SENT_VIA_EMAIL'));
        } catch (\RuntimeException|\Swift_SwiftException $e) {
            $rateLimiter->resetRateLimit($username);

            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->form->reset();

            $this->setMessage($this->translate('PLUGIN_ADMIN.FORGOT_FAILED_TO_EMAIL'), 'error');

            return $this->createRedirectResponse('/forgot');
        }

        $this->form->reset();

        return $this->createRedirectResponse('/login');
    }

    /**
     * @return ResponseInterface
     */
    public function taskRegister(): ResponseInterface
    {
        $this->page = $this->createPage('register');
        $this->form = $form = $this->getForm('admin-login-register');
        try {
            $this->checkNonce();
        } catch (PageExpiredException $e) {
            $this->setMessage($this->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'), 'error');

            return $this->createDisplayResponse();
        }

        // Note: Calls $this->doRegistration() to perform the user registration.
        $form->handleRequest($this->getRequest());
        $error = $form->getError();
        $errors = $form->getErrors();
        if ($error || $errors) {
            foreach ($errors as $field => $list) {
                foreach ((array)$list as $message) {
                    if ($message !== $error) {
                        $this->setMessage($message, 'error');
                    }
                }
            }

            return $this->createDisplayResponse();
        }

        $this->setMessage($this->translate('PLUGIN_ADMIN.LOGIN_LOGGED_IN'));

        return $this->createRedirectResponse('/');
    }

    /**
     * @param UserInterface $user
     * @return bool
     */
    protected function is2FA(UserInterface $user): bool
    {
        return $user && $user->authenticated && !$user->authorized && $user->get('twofa_enabled');
    }

    /**
     * @param string $name
     * @return callable
     */
    protected function getFormSubmitMethod(string $name): callable
    {
        switch ($name) {
            case 'login':
            case 'login-twofa':
            case 'admin-login-forgot':
            case 'admin-login-reset':
                return static function(array $data, array $files) {};
            case 'admin-login-register':
                return function(array $data, array $files) {
                    $this->doRegistration($data, $files);
                };
        }

        throw new \RuntimeException('Unknown form');
    }

    /**
     * Called by registration form when calling handleRequest().
     *
     * @param array $data
     * @param array $files
     */
    private function doRegistration(array $data, array $files): void
    {
        if (Admin::doAnyUsersExist()) {
            throw new \RuntimeException('A user account already exists, please create an admin account manually.', 400);
        }

        $login = $this->getLogin();
        if (!$login) {
            throw new \RuntimeException($this->grav['language']->translate('PLUGIN_LOGIN.PLUGIN_LOGIN_DISABLED', 500));
        }

        $data['title'] = $data['title'] ?? 'Administrator';

        // Do not allow form to set the following fields (make super user):
        $data['state'] = 'enabled';
        $data['access'] = ['admin' => ['login' => true, 'super' => true], 'site' => ['login' => true]];
        unset($data['groups']);

        // Create user.
        $user = $login->register($data, $files);

        // Log in the new super admin user.
        unset($this->grav['user']);
        $this->grav['user'] = $user;
        $this->grav['session']->user = $user;
        $user->authenticated = true;
        $user->authorized = $user->authorize('admin.login') ?? false;
    }

    /**
     * @return Login
     */
    private function getLogin(): Login
    {
        return $this->grav['login'];
    }

    /**
     * @return Email
     */
    private function getEmail(): Email
    {
        return $this->grav['Email'];
    }

    /**
     * @return UserCollectionInterface
     */
    private function getAccounts(): UserCollectionInterface
    {
        return $this->grav['accounts'];
    }
}
