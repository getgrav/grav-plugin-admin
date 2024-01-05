<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2024 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin;

use Grav\Common\Backup\Backups;
use Grav\Common\Cache;
use Grav\Common\Config\Config;
use Grav\Common\Debugger;
use Grav\Common\File\CompiledYamlFile;
use Grav\Common\Filesystem\Folder;
use Grav\Common\Flex\Types\Pages\PageIndex;
use Grav\Common\GPM\GPM as GravGPM;
use Grav\Common\GPM\Installer;
use Grav\Common\Grav;
use Grav\Common\Data;
use Grav\Common\Helpers\Excerpts;
use Grav\Common\Language\Language;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Common\Page\Media;
use Grav\Common\Page\Medium\ImageMedium;
use Grav\Common\Page\Medium\Medium;
use Grav\Common\Page\Page;
use Grav\Common\Page\Pages;
use Grav\Common\Page\Collection;
use Grav\Common\Plugins;
use Grav\Common\Security;
use Grav\Common\User\Interfaces\UserCollectionInterface;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Common\Utils;
use Grav\Framework\Flex\Flex;
use Grav\Framework\Psr7\Response;
use Grav\Framework\RequestHandler\Exception\RequestException;
use Grav\Plugin\Login\TwoFactorAuth\TwoFactorAuth;
use Grav\Common\Yaml;
use PicoFeed\Parser\MalformedXmlException;
use Psr\Http\Message\ResponseInterface;
use RocketTheme\Toolbox\Event\Event;
use RocketTheme\Toolbox\File\File;
use RocketTheme\Toolbox\File\YamlFile;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceLocator;
use Twig\Loader\FilesystemLoader;

/**
 * Class AdminController
 *
 * @package Grav\Plugin
 */
class AdminController extends AdminBaseController
{
    /**
     * @param Grav|null $grav
     * @param string|null $view
     * @param string|null $task
     * @param string|null $route
     * @param array|null $post
     * @return void
     */
    public function initialize(Grav $grav = null, $view = null, $task = null, $route = null, $post = null)
    {
        $this->grav = $grav;
        $this->admin = $this->grav['admin'];
        $this->view = $view;
        $this->task = $task ?: 'display';
        if (isset($post['data'])) {
            $this->data = $this->getPost($post['data']);
            unset($post['data']);
        } else {
            // Backwards compatibility for Form plugin <= 1.2
            $this->data = $this->getPost($post);
        }
        $this->post  = $this->getPost($post);
        $this->route = $route;

        $this->grav->fireEvent('onAdminControllerInit', new Event(['controller' => &$this]));
    }

    // GENERAL TASKS

    /**
     * Keep alive
     *
     * Route: POST /task:keepAlive (AJAX call)
     *
     * @return void
     */
    protected function taskKeepAlive(): void
    {
        // This task is available for all admin users.
        $response = new Response(200);

        $this->close($response);
    }

    /**
     * Clear the cache.
     *
     * Route: GET /cache.json/task:clearCache (AJAX call)
     *
     * @return bool True if the action was performed.
     */
    protected function taskClearCache()
    {
        if (!$this->authorizeTask('clear cache', ['admin.cache', 'admin.maintenance', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        // get optional cleartype param
        $clear_type = $this->grav['uri']->param('cleartype');

        if ($clear_type) {
            $clear = $clear_type;
        } else {
            $clear = 'standard';
        }

        if ($clear === 'purge') {
            $msg = Cache::purgeJob();
            $this->admin->json_response = [
                'status'  => 'success',
                'message' => $msg,
            ];
        } else {
            $results = Cache::clearCache($clear);
            if (count($results) > 0) {
                $this->admin->json_response = [
                    'status'  => 'success',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.CACHE_CLEARED') . ' <br />' . $this->admin::translate('PLUGIN_ADMIN.METHOD') . ': ' . $clear . ''
                ];
            } else {
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.ERROR_CLEARING_CACHE')
                ];
            }
        }

        return true;
    }

    /**
     * Handles form and saves the input data if its valid.
     *
     * Route: POST /pages?task:save
     * Route: POST /user?task:save
     * Route: POST /*?task:save
     *
     * @return bool True if the action was performed.
     */
    public function taskSave()
    {
        if (!$this->authorizeTask('save', $this->dataPermissions())) {
            return false;
        }

        $this->grav['twig']->twig_vars['current_form_data'] = (array)$this->data;

        switch ($this->view) {
            case 'pages':
                // Not used if Flex-Objects plugin handles pages.
                return $this->savePage();
            case 'user':
                // Not used if Flex-Objects plugin handles users.
                return $this->saveUser();
            default:
                if ($this->saveDefault()) {
                    $route = $this->grav['uri']::getCurrentRoute();
                    $this->setRedirect($route->withGravParam('task', null)->toString(), 302);
                    $this->redirect();
                }

                return false;
        }
    }

    /**
     * @return bool
     */
    protected function saveDefault()
    {
        try {
            // Handle standard data types.
            $type = $this->getDataType();

            $obj = $this->admin->getConfigurationData($type, $this->data);
            $obj->validate();
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->setMessage($e->getMessage(), 'error');

            return false;
        }

        $obj->filter(false, true);

        $obj = $this->storeFiles($obj);

        if ($obj) {
            // Event to manipulate data before saving the object
            $this->grav->fireEvent('onAdminSave', new Event(['object' => &$obj]));
            $obj->save();
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_SAVED'), 'info');
            $this->grav->fireEvent('onAdminAfterSave', new Event(['object' => $obj]));
        }

        Cache::clearCache('invalidate');

        // Force configuration reload.
        /** @var Config $config */
        $config = $this->grav['config'];
        $config->reload();

        if ($this->view === 'config') {
            $this->setRedirect($this->admin->getAdminRoute("/{$this->view}/{$this->route}")->toString());
        }

        return true;
    }

    // USER TASKS

    /**
     * Handle logout.
     *
     * Route: GET /task:logout
     * Route: POST ?task=logout
     *
     * @return bool True if the action was performed.
     */
    protected function taskLogout()
    {
        if (!$this->authorizeTask('logout', ['admin.login', 'admin.super'])) {
            return false;
        }

        $this->admin->logout($this->data, $this->post);
    }

    /**
     * Route: POST /ajax.json/task:regenerate2FASecret (AJAX call)
     *
     * @return bool
     */
    public function taskRegenerate2FASecret()
    {
        if (!$this->authorizeTask('regenerate 2FA Secret', ['admin.login', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        try {
            /** @var UserInterface $user */
            $user = $this->grav['user'];

            /** @var TwoFactorAuth $twoFa */
            $twoFa = $this->grav['login']->twoFactorAuth();
            $secret = $twoFa->createSecret();
            $image = $twoFa->getQrImageData($user->username, $secret);

            $user->set('twofa_secret', $secret);

            // TODO: data user can also use save, but please test it before removing this code.
            if ($user instanceof \Grav\Common\User\DataUser\User) {
                // Save secret into the user file.
                $file = $user->file();
                if ($file->exists()) {
                    $content = (array)$file->content();
                    $content['twofa_secret'] = $secret;
                    $file->save($content);
                    $file->free();
                }
            } else {
                $user->save();
            }

            $this->admin->json_response = ['status' => 'success', 'image' => $image, 'secret' => preg_replace('|(\w{4})|', '\\1 ', $secret)];
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];
            return false;
        }

        return true;
    }

    /**
     * Save user account.
     *
     * Called by more general save task.
     *
     * @note Not used if Flex-Objects plugin handles users.
     *
     * @return bool
     */
    protected function saveUser()
    {
        /** @var UserCollectionInterface $users */
        $users = $this->grav['accounts'];

        $user = $users->load($this->admin->route);

        if (!$this->admin->authorize(['admin.super', 'admin.users'])) {
            // no user file or not admin.super or admin.users
            if ($user->username !== $this->grav['user']->username) {
                $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' save.','error');

                return false;
            }
        }

        /** @var Data\Blueprint $blueprint */
        $blueprint = $user->blueprints();
        $data = $blueprint->processForm($this->admin->cleanUserPost((array)$this->data));
        $data = new Data\Data($data, $blueprint);

        try {
            $data->validate();
            $data->filter();
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->setMessage($e->getMessage(), 'error');

            return false;
        }

        $user->update($data->toArray());

        $user = $this->storeFiles($user);

        if ($user) {
            // Event to manipulate data before saving the object
            $this->grav->fireEvent('onAdminSave', new Event(['object' => &$user]));
            $user->save();
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_SAVED'), 'info');
            $this->grav->fireEvent('onAdminAfterSave', new Event(['object' => $user]));
        }

        if ($user->username === $this->grav['user']->username) {
            /** @var UserCollectionInterface $users */
            $users = $this->grav['accounts'];

            //Editing current user. Reload user object
            $this->grav['user']->undef('avatar');
            $this->grav['user']->merge($users->load($this->admin->route)->toArray());
        }

        return true;
    }

    // DASHBOARD TASKS

    /**
     * Get Notifications
     *
     * Route: POST /task:getNotifications (AJAX call)
     *
     * @return bool
     */
    protected function taskGetNotifications()
    {
        if (!$this->authorizeTask('dashboard', ['admin.login', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        // do we need to force a reload
        $refresh = $this->data['refresh'] === 'true';
        $filter = $this->data['filter'] ?? '';
        $filter_types = !empty($filter) ? array_map('trim', explode(',', $filter)) : [];

        try {
            $notifications = $this->admin->getNotifications($refresh);
            $notification_data = [];

            foreach ($notifications as $type => $type_notifications) {
                if ($filter_types && in_array($type, $filter_types, true)) {
                    $twig_template = 'partials/notification-' . $type . '-block.html.twig';
                    $notification_data[$type] = $this->grav['twig']->processTemplate($twig_template, ['notifications' => $type_notifications]);
                }
            }

            $json_response = [
                'status'        => 'success',
                'notifications' => $notification_data
            ];
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];
        }

        $this->sendJsonResponse($json_response);
    }


    /**
     * Hide notifications.
     *
     * Route: POST /notifications.json/task:hideNotification/notification_id:ID (AJAX call)
     *
     * @return bool True if the action was performed.
     */
    protected function taskHideNotification()
    {
        if (!$this->authorizeTask('hide notification', ['admin.login', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $notification_id = $this->grav['uri']->param('notification_id');

        if (!$notification_id) {
            $this->admin->json_response = [
                'status' => 'error'
            ];

            return false;
        }

        $filename = $this->grav['locator']->findResource('user://data/notifications/' . $this->grav['user']->username . YAML_EXT, true, true);
        $file     = CompiledYamlFile::instance($filename);
        $data     = (array)$file->content();

        $date = new \DateTime();
        $data[$notification_id] = $date->format('r');
        $file->save($data);

        $this->admin->json_response = [
            'status' => 'success'
        ];

        return true;
    }

    /**
     * Get Newsfeeds
     *
     * Route: POST /ajax.json/task:getNewsFeed (AJAX call)
     *
     * @return bool
     */
    protected function taskGetNewsFeed()
    {
        if (!$this->authorizeTask('dashboard', ['admin.login', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $refresh = $this->data['refresh'] === 'true' ? true : false;

        try {
            $feed = $this->admin->getFeed($refresh);
            $feed_data = $this->grav['twig']->processTemplate('partials/feed-block.html.twig', ['feed' => $feed]);

            $json_response = [
                'status'    => 'success',
                'feed_data' => $feed_data
            ];
        } catch (MalformedXmlException $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];
        }

        $this->sendJsonResponse($json_response);
    }

    // BACKUP TASKS

    /**
     * Handle the backup action
     *
     * Route: GET /backup.json/id:BACKUP_ID/task:backup (AJAX call)
     *
     * @return bool True if the action was performed.
     */
    protected function taskBackup()
    {
        if (!$this->authorizeTask('backup', ['admin.maintenance', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $param_sep = $this->grav['config']->get('system.param_sep', ':');
        $download = $this->grav['uri']->param('download');

        try {
            if ($download) {
                $filename = Utils::basename(base64_decode(urldecode($download)));
                $file = $this->grav['locator']->findResource("backup://{$filename}", true);
                if (!$file || !Utils::endsWith($filename, '.zip', false)) {
                    header('HTTP/1.1 401 Unauthorized');
                    exit();
                }

                Utils::download($file, true);
            }

            $id = $this->grav['uri']->param('id', 0);
            $backup = Backups::backup($id);
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->json_response = [
                'status' => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.AN_ERROR_OCCURRED') . '. ' . htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')
            ];

            return true;
        }

        $download = urlencode(base64_encode($backup));
        $url = rtrim($this->grav['uri']->rootUrl(false), '/') . '/' . trim($this->admin->base,
                '/') . '/task' . $param_sep . 'backup/download' . $param_sep . $download . '/admin-nonce' . $param_sep . Utils::getNonce('admin-form');

        $this->admin->json_response = [
            'status' => 'success',
            'message' => $this->admin::translate('PLUGIN_ADMIN.YOUR_BACKUP_IS_READY_FOR_DOWNLOAD') . '. <a href="' . $url . '" class="button">' . $this->admin::translate('PLUGIN_ADMIN.DOWNLOAD_BACKUP') . '</a>',
            'toastr' => [
                'timeOut' => 0,
                'extendedTimeOut' => 0,
                'closeButton' => true
            ]
        ];

        return true;
    }

    /**
     * Handle delete backup action
     *
     * Route: GET /backup.json/backup:BACKUP_FILE/task:backupDelete (AJAX call)
     *
     * @return bool
     */
    protected function taskBackupDelete()
    {
        if (!$this->authorizeTask('backup', ['admin.maintenance', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $backup = $this->grav['uri']->param('backup', null);

        if (null !== $backup) {
            $filename = Utils::basename(base64_decode(urldecode($backup)));
            $file = $this->grav['locator']->findResource("backup://{$filename}", true);

            if ($file && Utils::endsWith($filename, '.zip', false)) {
                unlink($file);

                $this->admin->json_response = [
                    'status'  => 'success',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.BACKUP_DELETED'),
                    'toastr'  => [
                        'closeButton' => true
                    ]
                ];

                return true;
            }
        }

        $this->admin->json_response = [
            'status'  => 'error',
            'message' => $this->admin::translate('PLUGIN_ADMIN.BACKUP_NOT_FOUND'),
        ];

        return true;
    }

    // PLUGIN / THEME TASKS

    /**
     * Enable a plugin.
     *
     * Route: GET /plugins/SLUG/task:enable
     *
     * @return bool True if the action was performed.
     */
    public function taskEnable()
    {
        if ($this->view !== 'plugins') {
            return false;
        }

        if (!$this->authorizeTask('enable plugin', ['admin.plugins', 'admin.super'])) {
            return false;
        }

        $type = $this->getDataType();
        $this->updatePluginState($type, ['enabled' => true]);

        $this->post = ['_redirect' => 'plugins'];
        if ($this->grav['uri']->param('redirect')) {
            $this->post = ['_redirect' => 'plugins/' . $this->route];
        }
        $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_ENABLED_PLUGIN'), 'info');

        Cache::clearCache('invalidate');

        return true;
    }

    /**
     * Disable a plugin.
     *
     * Route: GET /plugins/SLUG/task:disable
     *
     * @return bool True if the action was performed.
     */
    public function taskDisable()
    {
        if ($this->view !== 'plugins') {
            return false;
        }

        if (!$this->authorizeTask('disable plugin', ['admin.plugins', 'admin.super'])) {
            return false;
        }

        $type = $this->getDataType();
        $this->updatePluginState($type, ['enabled' => false]);

        $this->post = ['_redirect' => 'plugins'];
        $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_DISABLED_PLUGIN'), 'info');

        Cache::clearCache('invalidate');

        return true;
    }

    /**
     * @param string $type
     * @param array $value
     * @return void
     */
    protected function updatePluginState(string $type, array $value): void
    {
        $obj = Plugins::get(preg_replace('|plugins/|', '', $type));
        if (null === $obj) {
            throw new \RuntimeException("Plugin '{$type}' doesn't exist!");
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->grav['locator'];

        // Configuration file will be saved to the existing config stream.
        $filename = $locator->findResource('config://') . "/{$type}.yaml";

        $file = YamlFile::instance($filename);
        $contents = $value + $file->content();

        $file->save($contents);
    }

    /**
     * Set the default theme.
     *
     * Route: GET /themes/SLUG/task:activate
     *
     * @return bool True if the action was performed.
     */
    public function taskActivate()
    {
        if ($this->view !== 'themes') {
            return false;
        }

        if (!$this->authorizeTask('activate theme', ['admin.themes', 'admin.super'])) {
            return false;
        }

        $this->post = ['_redirect' => 'themes' ];

        // Make sure theme exists (throws exception)
        $name = $this->route;
        $this->grav['themes']->get($name);

        // Store system configuration.
        $system = $this->admin->getConfigurationData('config/system');
        $system->set('pages.theme', $name);
        $system->save();

        // Force configuration reload and save.
        /** @var Config $config */
        $config = $this->grav['config'];
        $config->reload()->save();

        $config->set('system.pages.theme', $name);

        $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_CHANGED_THEME'), 'info');

        Cache::clearCache('invalidate');

        $this->post = ['_redirect' => 'themes/' . $name ];

        return true;
    }

    // INSTALL & UPGRADE

    /**
     * Handles updating Grav
     *
     * Route: GET /update.json/task:updategrav (AJAX call)
     *
     * @return bool False if user has no permissions.
     */
    public function taskUpdategrav()
    {
        if (!$this->authorizeTask('install grav', ['admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $gpm     = Gpm::GPM();
        $version = $gpm->grav->getVersion();
        $result  = Gpm::selfupgrade();

        if ($result) {
            $json_response = [
                'status'  => 'success',
                'type'    => 'updategrav',
                'version' => $version,
                'message' => $this->admin::translate('PLUGIN_ADMIN.GRAV_WAS_SUCCESSFULLY_UPDATED_TO') . ' ' . $version
            ];
        } else {
            $json_response = [
                'status'  => 'error',
                'type'    => 'updategrav',
                'version' => GRAV_VERSION,
                'message' => $this->admin::translate('PLUGIN_ADMIN.GRAV_UPDATE_FAILED') . ' <br>' . Installer::lastErrorMsg()
            ];
        }

        $this->sendJsonResponse($json_response);
    }

    /**
     * Handles uninstalling plugins and themes
     *
     * @return bool True if the action was performed
     * @deprecated Not being used anymore
     */
    public function taskUninstall()
    {
        $type = $this->view;
        if ($type !== 'plugins' && $type !== 'themes') {
            return false;
        }

        if (!$this->authorizeTask('uninstall ' . $type, ['admin.' . $type, 'admin.super'])) {
            return false;
        }

        $package = $this->route;

        $result = Gpm::uninstall($package, []);

        if ($result) {
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.UNINSTALL_SUCCESSFUL'), 'info');
        } else {
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.UNINSTALL_FAILED'), 'error');
        }

        $this->post = ['_redirect' => $this->view];

        return true;
    }

    /**
     * Toggle the gpm.releases setting
     *
     * Route: POST /ajax.json/task:gpmRelease (AJAX call)
     *
     * @return bool
     */
    protected function taskGpmRelease()
    {
        if (!$this->authorizeTask('configuration', ['admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        // Default release state
        $release = 'stable';
        $reload  = false;

        // Get the testing release value if set
        if ($this->post['release'] === 'testing') {
            $release = 'testing';
        }

        $config          = $this->grav['config'];
        $current_release = $config->get('system.gpm.releases');

        // If the releases setting is different, save it in the system config
        if ($current_release !== $release) {
            $data = new Data\Data($config->get('system'));
            $data->set('gpm.releases', $release);

            // Get the file location
            $file = CompiledYamlFile::instance($this->grav['locator']->findResource('config://system.yaml'));
            $data->file($file);

            // Save the configuration
            $data->save();
            $config->reload();
            $reload = true;
        }

        $this->admin->json_response = ['status' => 'success', 'reload' => $reload];

        return true;
    }

    /**
     * Get update status from GPM
     *
     * Request: POST /update.json/task:getUpdates (AJAX call)
     *
     * @return bool
     */
    protected function taskGetUpdates()
    {
        if ($this->view !== 'update') {
            return false;
        }

        if (!$this->authorizeTask('dashboard', ['admin.plugins', 'admin.themes', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $data  = $this->post;
        $flush = !empty($data['flush']);

        if (isset($this->grav['session'])) {
            $this->grav['session']->close();
        }

        try {
            $gpm = new GravGPM($flush);

            $resources_updates = $gpm->getUpdatable();
            foreach ($resources_updates as $key => $update) {
                if (!is_iterable($update)) {
                    continue;
                }

                foreach ($update as $slug => $item) {
                    $resources_updates[$key][$slug] = $item;
                }
            }

            if ($gpm->grav !== null) {
                $grav_updates = [
                    'isUpdatable' => $gpm->grav->isUpdatable(),
                    'assets'      => $gpm->grav->getAssets(),
                    'version'     => GRAV_VERSION,
                    'available'   => $gpm->grav->getVersion(),
                    'date'        => $gpm->grav->getDate(),
                    'isSymlink'   => $gpm->grav->isSymlink()
                ];

                $this->admin->json_response = [
                    'status'  => 'success',
                    'payload' => [
                        'resources' => $resources_updates,
                        'grav'      => $grav_updates,
                        'installed' => $gpm->countInstalled(),
                        'flushed'   => $flush
                    ]
                ];
            } else {
                $this->admin->json_response = ['status' => 'error', 'message' => 'Cannot connect to the GPM'];

                return false;
            }

        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];

            return false;
        }

        return true;
    }

    /**
     * Handle getting a new package dependencies needed to be installed.
     *
     * Route: /plugins.json/task:getPackagesDependencies (AJAX call)
     * Route: /themes.json/task:getPackagesDependencies (AJAX call)
     *
     * @return bool
     */
    protected function taskGetPackagesDependencies()
    {
        $type = $this->view;
        if ($type !== 'plugins' && $type !== 'themes') {
            return false;
        }

        if (!$this->authorizeTask('get package dependencies', ['admin.' . $type, 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $data     = $this->post;
        $packages = isset($data['packages']) ? explode(',', $data['packages']) : '';
        $packages = (array)$packages;

        try {
            $this->admin->checkPackagesCanBeInstalled($packages);
            $dependencies = $this->admin->getDependenciesNeededToInstall($packages);
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];

            return false;
        }

        $this->admin->json_response = ['status' => 'success', 'dependencies' => $dependencies];

        return true;
    }

    /**
     * Route: /plugins.json/task:installDependenciesOfPackages (AJAX call)
     * Route: /themes.json/task:installDependenciesOfPackages (AJAX call)
     *
     * @return bool
     */
    protected function taskInstallDependenciesOfPackages()
    {
        $type = $this->view;
        if ($type !== 'plugins' && $type !== 'themes') {
            return false;
        }

        if (!$this->authorizeTask('install dependencies', ['admin.' . $type, 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $data = $this->post;
        $packages = isset($data['packages']) ? explode(',', $data['packages']) : '';
        $packages = (array)$packages;

        try {
            $dependencies = $this->admin->getDependenciesNeededToInstall($packages);
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];

            return false;
        }

        $result = Gpm::install(array_keys($dependencies), ['theme' => $type === 'themes']);

        if ($result) {
            $this->admin->json_response = ['status' => 'success', 'message' => 'Dependencies installed successfully'];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSTALLATION_FAILED')
            ];
        }

        return true;
    }

    /**
     * Route: /plugins.json/task:installPackage (AJAX call)
     * Route: /themes.json/task:installPackage (AJAX call)
     *
     * @param bool $reinstall
     * @return bool
     */
    protected function taskInstallPackage($reinstall = false)
    {
        $type = $this->view;
        if ($type !== 'plugins' && $type !== 'themes') {
            return false;
        }

        if (!$this->authorizeTask('install ' . $type, ['admin.' . $type, 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $data = $this->post;
        $package = $data['package'] ?? '';
        try {
            $result = Gpm::install($package, ['theme' => $type === 'themes']);
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $msg = $e->getMessage();
            $msg = Utils::contains($msg, '401 Unauthorized') ? "ERROR: License key for this resource is invalid." : $msg;
            $msg = Utils::contains($msg, '404 Not Found') ? "ERROR: Resource not found" : $msg;

            $this->admin->json_response = ['status' => 'error', 'message' => htmlspecialchars($msg, ENT_QUOTES | ENT_HTML5, 'UTF-8')];

            return false;
        }

        if ($result) {
            $this->admin->json_response = [
                'status'  => 'success',
                'message' => $this->admin::translate(is_string($result) ? $result : sprintf($this->admin::translate($reinstall ?: 'PLUGIN_ADMIN.PACKAGE_X_REINSTALLED_SUCCESSFULLY',
                    null), $package))
            ];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate($reinstall ?: 'PLUGIN_ADMIN.INSTALLATION_FAILED')
            ];
        }

        return true;
    }

    /**
     * Handle removing a package
     *
     * Route: /plugins.json/task:removePackage (AJAX call)
     * Route: /themes.json/task:removePackage (AJAX call)
     *
     * @return bool
     */
    protected function taskRemovePackage(): bool
    {
        $type = $this->view;
        if ($type !== 'plugins' && $type !== 'themes') {
            return false;
        }

        if (!$this->authorizeTask('uninstall ' . $type, ['admin.' . $type, 'admin.super'])) {
            $json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            $this->sendJsonResponse($json_response, 403);
        }

        $data    = $this->post;
        $package = $data['package'] ?? '';
        $result = false;

        //check if there are packages that have this as a dependency. Abort and show which ones
        $dependent_packages = $this->admin->getPackagesThatDependOnPackage($package);
        if (count($dependent_packages) > 0) {
            if (count($dependent_packages) > 1) {
                $message = 'The installed packages <cyan>' . implode('</cyan>, <cyan>',
                        $dependent_packages) . '</cyan> depends on this package. Please remove those first.';
            } else {
                $message = 'The installed package <cyan>' . implode('</cyan>, <cyan>',
                        $dependent_packages) . '</cyan> depends on this package. Please remove it first.';
            }

            $json_response = ['status' => 'error', 'message' => $message];

            $this->sendJsonResponse($json_response, 200);
        }

        $dependencies = false;
        try {
            $dependencies = $this->admin->dependenciesThatCanBeRemovedWhenRemoving($package);
            $result       = Gpm::uninstall($package, []);
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];

            $this->sendJsonResponse($json_response, 200);
        }

        if ($result) {
            $json_response = [
                'status'       => 'success',
                'dependencies' => $dependencies,
                'message'      => $this->admin::translate(is_string($result) ? $result : 'PLUGIN_ADMIN.UNINSTALL_SUCCESSFUL')
            ];

            $this->sendJsonResponse($json_response, 200);
        }

        $json_response = [
            'status'  => 'error',
            'message' => $this->admin::translate('PLUGIN_ADMIN.UNINSTALL_FAILED')
        ];

        $this->sendJsonResponse($json_response, 200);
    }

    /**
     * Handle reinstalling a package
     *
     * Route: /plugins.json/task:reinstallPackage (AJAX call)
     * Route: /themes.json/task:reinstallPackage (AJAX call)
     *
     * @return bool
     */
    protected function taskReinstallPackage()
    {
        $type = $this->view;
        if ($type !== 'plugins' && $type !== 'themes') {
            return false;
        }

        if (!$this->authorizeTask('install ' . $type, ['admin.' . $type, 'admin.super'])) {
            $json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            $this->sendJsonResponse($json_response, 403);
        }

        $data = $this->post;
        $slug            = $data['slug'] ?? '';
        $package_name    = $data['package_name'] ?? '';
        $current_version = $data['current_version'] ?? '';

        $url = "https://getgrav.org/download/{$type}s/$slug/$current_version";

        $result = Gpm::directInstall($url);

        if ($result === true) {
            $this->admin->json_response = [
                'status'  => 'success',
                'message' => $this->admin::translate(sprintf($this->admin::translate('PLUGIN_ADMIN.PACKAGE_X_REINSTALLED_SUCCESSFULLY',
                    null), $package_name))
            ];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.REINSTALLATION_FAILED')
            ];
        }

        return true;
    }

    /**
     * Handle direct install.
     *
     * Request: POST /tools/direct-install?task=directInstall
     *
     * @return bool
     */
    protected function taskDirectInstall()
    {
        if (!$this->authorizeTask('install', ['admin.super'])) {
            return false;
        }

        $file_path = $this->data['file_path'] ?? null;

        if (isset($_FILES['uploaded_file'])) {

            // Check $_FILES['file']['error'] value.
            switch ($_FILES['uploaded_file']['error']) {
                case UPLOAD_ERR_OK:
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.NO_FILES_SENT'), 'error');
                    return false;
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.EXCEEDED_FILESIZE_LIMIT'), 'error');
                    return false;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.UPLOAD_ERR_NO_TMP_DIR'), 'error');
                    return false;
                default:
                    $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.UNKNOWN_ERRORS'), 'error');
                    return false;
            }

            $file_name = $_FILES['uploaded_file']['name'];
            $file_path = $_FILES['uploaded_file']['tmp_name'];

            // Handle bad filenames.
            if (!Utils::checkFilename($file_name)) {
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.UNKNOWN_ERRORS')
                ];

                return false;
            }
        }


        $result = Gpm::directInstall($file_path);

        if ($result === true) {
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INSTALLATION_SUCCESSFUL'), 'info');
        } else {
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INSTALLATION_FAILED') . ': ' . $result,
                'error');
        }

        $this->setRedirect('/tools');

        return true;
    }

    // PAGE TASKS

    /**
     * Handles creating an empty page folder (without markdown file)
     *
     * Route: /pages
     *
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool True if the action was performed.
     */
    public function taskSaveNewFolder()
    {
        if ($this->view !== 'pages') {
            return false;
        }

        if (!$this->authorizeTask('new folder', ['admin.pages', 'admin.pages.create', 'admin.super'])) {
            return false;
        }

        $data = (array)$this->data;

        $folder = $data['folder'] ?? '';
        if ($folder === '' || mb_strpos($folder, '/') !== false) {
            throw new \RuntimeException('Creating folder failed: bad folder name', 400);
        }

        if ($data['route'] === '' || $data['route'] === '/') {
            $path = $this->grav['locator']->findResource('page://');
        } else {
            $pages = $this->admin::enablePages();

            $page = $pages->find($data['route']);
            if (!$page) {
                return false;
            }
            $path = $page->path();
        }

        $orderOfNewFolder = static::getNextOrderInFolder($path);
        $new_path         = $path . '/' . $orderOfNewFolder . '.' . $folder;

        Folder::create($new_path);
        Cache::clearCache('invalidate');

        $this->grav->fireEvent('onAdminAfterSaveAs', new Event(['path' => $new_path]));

        $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_SAVED'), 'info');

        $this->setRedirect($this->admin->getAdminRoute("/{$this->view}")->toString());

        return true;
    }

    /**
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool
     */
    protected function savePage()
    {
        $reorder = true;

        $data = (array)$this->data;
        $this->grav['twig']->twig_vars['current_form_data'] = $data;

        $pages = $this->admin::enablePages();

        // Find new parent page in order to build the path.
        $path = trim($data['route'] ?? dirname($this->admin->route), '/');
        if ($path === '.') {
            $path = '';
        }

        /** @var PageInterface $obj */
        $obj = $this->admin->page(true);

        $folder = $data['folder'] ?? null;
        if ($folder === '' || mb_strpos($folder, '/') !== false) {
            throw new \RuntimeException('Saving page failed: bad folder name', 400);
        }

        if (!isset($data['folder']) || !$data['folder']) {
            $data['folder'] = $obj->slug();
            $this->data['folder'] = $obj->slug();
        }

        // Check for valid frontmatter
        if (isset($data['frontmatter']) && !$this->checkValidFrontmatter($data['frontmatter'])) {
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INVALID_FRONTMATTER_COULD_NOT_SAVE'),
                'error');
            return false;
        }

        // XSS Checks for page content
        $xss_whitelist = $this->grav['config']->get('security.xss_whitelist', 'admin.super');
        if (!$this->admin->authorize($xss_whitelist)) {
            $check_what = ['header' => $data['header'] ?? '', 'frontmatter' => $data['frontmatter'] ?? '', 'content' => $data['content'] ?? ''];
            $results = Security::detectXssFromArray($check_what);
            if (!empty($results)) {
                $this->admin->setMessage('<i class="fa fa-ban"></i> ' . $this->admin::translate('PLUGIN_ADMIN.XSS_ONSAVE_ISSUE'),
                    'error');
                return false;
            }
        }

        if ($path !== '') {
            // First try to get page by its path.
            $parent = $pages->get(GRAV_ROOT . '/' . $path);
            if (!$parent) {
                // Fall back using the route.
                $route = '/' . preg_replace(PageIndex::PAGE_ROUTE_REGEX, '/', $path);
                $parent = $pages->find($route, true);
                if (!$parent) {
                    throw new \RuntimeException('New parent page cannot be resolved!');
                }
            }
        } else {
            $parent = $pages->root();
        }

        $original_order = (int)trim($obj->order(), '.');

        try {
            // Change parent if needed and initialize move (might be needed also on ordering/folder change).
            $obj = $obj->move($parent);
            $this->preparePage($obj, false, $obj->language());
            $obj->validate();

        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->setMessage($e->getMessage(), 'error');

            return false;
        }
        $obj->filter();

        // rename folder based on visible
        if ($original_order === 1000) {
            // increment order to force reshuffle
            $obj->order($original_order + 1);
        }

        if (isset($data['order']) && !empty($data['order'])) {
            $reorder = explode(',', $data['order']);
        }

        // add or remove numeric prefix based on ordering value
        if (isset($data['ordering'])) {
            if ($data['ordering'] && !$obj->order()) {
                $obj->order(static::getNextOrderInFolder($obj->parent()->path()));
                $reorder = false;
            } elseif (!$data['ordering'] && $obj->order()) {
                $obj->folder($obj->slug());
            }
        }

        $obj = $this->storeFiles($obj);

        if ($obj) {
            // Event to manipulate data before saving the object
            // DEPRECATED: page
            $this->grav->fireEvent('onAdminSave', new Event(['object' => &$obj, 'page' => &$obj]));

            $obj->save($reorder);

            Cache::clearCache('invalidate');

            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_SAVED'), 'info');
            // DEPRECATED: page
            $this->grav->fireEvent('onAdminAfterSave', new Event(['object' => $obj, 'page' => $obj]));
        }

        if (method_exists($obj, 'unsetRouteSlug')) {
            $obj->unsetRouteSlug();
        }

        $multilang = $this->isMultilang();

        if ($multilang && !$obj->language()) {
            $obj->language($this->admin->getLanguage());
        }
        $admin_route = $this->admin->base;

        $route           = $obj->rawRoute();
        $redirect_url = ($multilang ? '/' . $obj->language() : '') . $admin_route . '/' . $this->view . $route;
        $this->setRedirect($redirect_url);

        return true;
    }

    /**
     * Save page as a new copy.
     *
     * Route: /pages
     *
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool True if the action was performed.
     * @throws \RuntimeException
     */
    protected function taskCopy()
    {
        if ($this->view !== 'pages') {
            return false;
        }

        if (!$this->authorizeTask('copy page', ['admin.pages', 'admin.pages.create', 'admin.super'])) {
            return false;
        }

        try {
            $pages = $this->admin::enablePages();

            // Get the current page.
            $original_page = $this->admin->page(true);

            // Find new parent page in order to build the path.
            $parent = $original_page->parent() ?: $pages->root();
            // Make a copy of the current page and fill the updated information into it.
            $page = $original_page->copy($parent);

            $order = 0;
            if ($page->order()) {
                $order = $this->getNextOrderInFolder($page->parent()->path());
            }

            // Make sure the header is loaded in case content was set through raw() (expert mode)
            $page->header();

            if ($page->order()) {
                $page->order($order);
            }

            $folder = $this->findFirstAvailable('folder', $page);
            $slug   = $this->findFirstAvailable('slug', $page);

            $page->path($page->parent()->path() . DS . $page->order() . $folder);
            $page->route($page->parent()->route() . '/' . $slug);
            $page->rawRoute($page->parent()->rawRoute() . '/' . $slug);

            // Append progressive number to the copied page title
            $match  = preg_split('/(\d+)(?!.*\d)/', $original_page->title(), 2, PREG_SPLIT_DELIM_CAPTURE);
            $header = $page->header();
            if (!isset($match[1])) {
                $header->title = $match[0] . ' 2';
            } else {
                $header->title = $match[0] . ((int)$match[1] + 1);
            }

            $page->header($header);
            $page->save(false);

            $redirect = $this->view . $page->rawRoute();
            $header   = $page->header();

            if (isset($header->slug)) {
                $match        = preg_split('/-(\d+)$/', $header->slug, 2, PREG_SPLIT_DELIM_CAPTURE);
                $header->slug = $match[0] . '-' . (isset($match[1]) ? (int)$match[1] + 1 : 2);
            }

            $page->header($header);

            $page->save();

            Cache::clearCache('invalidate');

            // DEPRECATED: page
            $this->grav->fireEvent('onAdminAfterSave', new Event(['object' => $page, 'page' => $page]));

            // Enqueue message and redirect to new location.
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_COPIED'), 'info');
            $this->setRedirect($redirect);

        } catch (\Exception $e) {
            throw new \RuntimeException('Copying page failed on error: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Reorder pages.
     *
     * Route: /pages
     *
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool True if the action was performed.
     */
    protected function taskReorder()
    {
        if ($this->view !== 'pages') {
            return false;
        }

        if (!$this->authorizeTask('reorder pages', ['admin.pages', 'admin.pages.update', 'admin.super'])) {
            return false;
        }

        $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.REORDERING_WAS_SUCCESSFUL'), 'info');

        return true;
    }

    /**
     * Delete page.
     *
     * Route: /pages
     *
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool True if the action was performed.
     * @throws \RuntimeException
     */
    protected function taskDelete()
    {
        if ($this->view !== 'pages') {
            return false;
        }

        if (!$this->authorizeTask('delete page', ['admin.pages', 'admin.pages.delete', 'admin.super'])) {
            return false;
        }

        try {
            $page = $this->admin->page();

            if (count($page->translatedLanguages()) > 1) {
                $page->file()->delete();
            } else {
                Folder::delete($page->path());
            }

            // DEPRECATED: page
            $this->grav->fireEvent('onAdminAfterDelete', new Event(['object' => $page, 'page' => $page]));

            Cache::clearCache('invalidate');

            // Set redirect to pages list.
            $redirect = 'pages';

            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_DELETED'), 'info');
            $this->setRedirect($redirect);

        } catch (\Exception $e) {
            throw new \RuntimeException('Deleting page failed on error: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Switch the content language. Optionally redirect to a different page.
     *
     * Route: /pages
     *
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool
     */
    protected function taskSwitchlanguage()
    {
        if ($this->view !== 'pages') {
            return false;
        }

        if (!$this->authorizeTask('switch language', ['admin.pages', 'admin.pages.list', 'admin.super'])) {
            return false;
        }

        $data = (array)$this->data;

        $language = $data['lang'] ?? $this->grav['uri']->param('lang');

        if (isset($data['redirect'])) {
            $redirect = '/pages/' . $data['redirect'];
        } else {
            $redirect = '/pages';
        }


        if ($language) {
            $this->grav['session']->admin_lang = $language ?: 'en';
        }

        $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_SWITCHED_LANGUAGE'), 'info');

        $this->setRedirect($this->admin->getAdminRoute($redirect)->toString());

        return true;
    }

    /**
     * Save the current page in a different language. Automatically switches to that language.
     *
     * Route: /pages
     *
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool True if the action was performed.
     */
    protected function taskSaveas()
    {
        if ($this->view !== 'pages') {
            return false;
        }

        if (!$this->authorizeTask('save as', ['admin.pages', 'admin.pages.create', 'admin.super'])) {
            return false;
        }

        /** @var Language $language */
        $language = $this->grav['language'];

        $data     = (array)$this->data;
        $lang = $data['lang'] ?? null;

        if ($lang) {
            $this->grav['session']->admin_lang = $lang ?: 'en';
        }

        $uri = $this->grav['uri'];
        $obj = $this->admin->page($uri->route());
        $this->preparePage($obj, false, $lang);

        $file = $obj->file();
        if ($file) {
            $filename = $this->determineFilenameIncludingLanguage($obj->name(), $lang);

            $path  = $obj->path() . DS . $filename;
            $aFile = File::instance($path);
            $aFile->save();

            $aPage = new Page();
            $aPage->init(new \SplFileInfo($path), $lang . '.md');
            $aPage->header($obj->header());
            $aPage->rawMarkdown($obj->rawMarkdown());
            $aPage->template($obj->template());
            $aPage->validate();
            $aPage->filter();

            // DEPRECATED: page
            $this->grav->fireEvent('onAdminSave', new Event(['object' => $aPage, 'page' => &$aPage]));

            $aPage->save();

            Cache::clearCache('invalidate');

            // DEPRECATED: page
            $this->grav->fireEvent('onAdminAfterSave', new Event(['object' => $aPage, 'page' => $aPage]));
        }

        $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.SUCCESSFULLY_SWITCHED_LANGUAGE'), 'info');

        // TODO: better multilanguage support needed.
        $this->setRedirect($language->getLanguageURLPrefix($lang) . $uri->route());

        return true;
    }

    /**
     * Continue to the new page.
     *
     * @note Not used if Flex-Objects plugin handles pages, users and user groups.
     *
     * @return bool True if the action was performed.
     */
    public function taskContinue()
    {
        $data = (array)$this->data;

        if ($this->view === 'users') {
            $username = strip_tags(strtolower($data['username']));
            $this->setRedirect("{$this->view}/{$username}");

            return true;
        }

        if ($this->view !== 'pages') {
            return false;
        }

        $route  = $data['route'] !== '/' ? $data['route'] : '';
        $folder = $data['folder'] ?? null;
        $title = $data['title'] ?? null;

        // Handle @slugify-{field} value, automatically slugifies the specified field
        if (null !== $folder && 0 === strpos($folder, '@slugify-')) {
            $folder = \Grav\Plugin\Admin\Utils::slug($data[substr($folder, 9)] ?? '');
        }
        if (!$folder) {
            $folder = \Grav\Plugin\Admin\Utils::slug($title) ?: '';
        }
        $folder = ltrim($folder, '_');
        if ($folder === '' || mb_strpos($folder, '/') !== false) {
            throw new \RuntimeException('Creating page failed: bad folder name', 400);
        }

        if (!empty($data['modular'])) {
            $folder = '_' . $folder;
        }

        $data['folder'] = $folder;

        $path = $route . '/' . $folder;
        $this->admin->session()->{$path} = $data;

        // Store the name and route of a page, to be used pre-filled defaults of the form in the future
        $this->admin->session()->lastPageName  = $data['name'];
        $this->admin->session()->lastPageRoute = $data['route'];

        $this->setRedirect("{$this->view}/" . ltrim($path, '/'));

        return true;
    }

    /**
     * $data['route'] = $this->grav['uri']->param('route');
     * $data['sortby'] = $this->grav['uri']->param('sortby', null);
     * $data['filters'] = $this->grav['uri']->param('filters', null);
     * $data['page'] $this->grav['uri']->param('page', true);
     * $data['base'] = $this->grav['uri']->param('base');
     * $initial = (bool) $this->grav['uri']->param('initial');
     *
     * @return ResponseInterface
     * @throws RequestException
     */
    protected function taskGetLevelListing(): ResponseInterface
    {
        $this->checkTaskAuthorization('save', $this->dataPermissions());

        $request = $this->getRequest();
        $data = $request->getParsedBody();

        if (!isset($data['field'])) {
            throw new RequestException($request, 'Bad Request', 400);
        }

        // Base64 decode the route
        $data['route'] = isset($data['route']) ? base64_decode($data['route']) : null;

        $initial = $data['initial'] ?? null;
        if ($initial) {
            $data['leaf_route'] = $data['route'];
            $data['route'] = null;
            $data['level'] = 1;
        }

        [$status, $message, $response,] = $this->getLevelListing($data);

        $json = [
            'status'  => $status,
            'message' => $this->admin::translate($message ?? 'PLUGIN_ADMIN.NO_ROUTE_PROVIDED'),
            'data' => array_values($response)
        ];

        return $this->createJsonResponse($json, 200);
    }

    /**
     * Route: /ajax.json
     *
     * @note Not used if Flex-Objects plugin handles pages.
     *
     * @return bool
     */
    protected function taskGetChildTypes()
    {
        if ($this->view !== 'ajax') {
            return false;
        }

        if (!$this->authorizeTask('get childtypes', ['admin.pages', 'admin.pages.list', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $data = $this->post;

        $route = $data['rawroute'] ?? null;
        if ($route) {
            /** @var Flex $flex */
            $flex = $this->grav['flex'];
            $page = $flex->getObject(trim($route, '/'), 'pages');
            if ($page instanceof PageInterface) {
                $child_type = $page->childType();
                if ($child_type !== '') {
                    $this->admin->json_response = [
                        'status' => 'success',
                        'child_type' => $child_type
                    ];
                    return true;
                }
            }
        }

        $this->admin->json_response = [
            'status'  => 'success',
            'child_type' => '',
        ];

        return true;
    }

    /**
     * Handles filtering the page by modular/visible/routable in the pages list.
     *
     * @note Used only in legacy pages.
     *
     * @return bool
     */
    protected function taskFilterPages()
    {
        if ($this->view !== 'pages-filter') {
            return false;
        }

        if (!$this->authorizeTask('filter pages', ['admin.pages', 'admin.pages.list', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $data = $this->post;

        $flags   = !empty($data['flags']) ? array_map('strtolower', explode(',', $data['flags'])) : [];
        $queries = !empty($data['query']) ? explode(',', $data['query']) : [];

        $pages = $this->admin::enablePages();

        /** @var Collection $collection */
        $collection = $pages->all();

        if (count($flags)) {
            // Filter by state
            $pageStates = [
                'modular',
                'nonmodular',
                'visible',
                'nonvisible',
                'routable',
                'nonroutable',
                'published',
                'nonpublished'
            ];

            if (count(array_intersect($pageStates, $flags)) > 0) {
                if (in_array('modular', $flags, true)) {
                    $collection = $collection->modular();
                }

                if (in_array('nonmodular', $flags, true)) {
                    $collection = $collection->nonModular();
                }

                if (in_array('visible', $flags, true)) {
                    $collection = $collection->visible();
                }

                if (in_array('nonvisible', $flags, true)) {
                    $collection = $collection->nonVisible();
                }

                if (in_array('routable', $flags, true)) {
                    $collection = $collection->routable();
                }

                if (in_array('nonroutable', $flags, true)) {
                    $collection = $collection->nonRoutable();
                }

                if (in_array('published', $flags, true)) {
                    $collection = $collection->published();
                }

                if (in_array('nonpublished', $flags, true)) {
                    $collection = $collection->nonPublished();
                }
            }
            foreach ($pageStates as $pageState) {
                if (($pageState = array_search($pageState, $flags, true)) !== false) {
                    unset($flags[$pageState]);
                }
            }

            // Filter by page type
            if ($flags) {
                $types = [];

                $pageTypes = array_keys(Pages::pageTypes());
                foreach ($pageTypes as $pageType) {
                    if (($pageKey = array_search($pageType, $flags, true)) !== false) {
                        $types[] = $pageType;
                        unset($flags[$pageKey]);
                    }
                }

                if (count($types)) {
                    $collection = $collection->ofOneOfTheseTypes($types);
                }
            }

            // Filter by page type
            if ($flags) {
                $accessLevels = $flags;
                $collection   = $collection->ofOneOfTheseAccessLevels($accessLevels);
            }
        }

        if (!empty($queries)) {
            foreach ($collection as $page) {
                foreach ($queries as $query) {
                    $query = trim($query);
                    if (stripos($page->getRawContent(), $query) === false
                        && stripos($page->title(), $query) === false
                        && stripos($page->folder(), $query) === false
                        && stripos($page->slug(), \Grav\Plugin\Admin\Utils::slug($query)) === false
                    ) {
                        $collection->remove($page);
                    }
                }
            }
        }

        $results = [];
        foreach ($collection as $path => $page) {
            $results[] = $page->route();
        }

        $this->admin->json_response = [
            'status'  => 'success',
            'message' => $this->admin::translate('PLUGIN_ADMIN.PAGES_FILTERED'),
            'results' => $results
        ];
        $this->admin->collection = $collection;

        return true;
    }


    /**
     * Process the page Markdown
     *
     * Preview task in the builtin editor.
     *
     * @return bool True if the action was performed.
     */
    protected function taskProcessMarkdown()
    {
        if (!$this->authorizeTask('process markdown', ['admin.pages', 'admin.pages.read', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        try {
            $page = $this->admin->page(true);

            if (!$page) {
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.NO_PAGE_FOUND')
                ];

                return false;
            }

            $this->preparePage($page, true);
            $page->header();
            $page->templateFormat('html');

            // Add theme template paths to Twig loader
            $template_paths = $this->grav['locator']->findResources('theme://templates');
            $this->grav['twig']->twig->getLoader()->addLoader(new FilesystemLoader($template_paths));

            $html = $page->content();

            $this->admin->json_response = ['status' => 'success', 'preview' => $html];
        } catch (\Exception $e) {
            /** @var Debugger $debugger */
            $debugger = $this->grav['debugger'];
            $debugger->addException($e);

            $this->admin->json_response = ['status' => 'error', 'message' => htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_HTML5, 'UTF-8')];

            return false;
        }

        return true;
    }

    // MEDIA TASKS

    /**
     * Determines the file types allowed to be uploaded
     *
     * Used by pagemedia field. Works only within legacy pages.
     *
     * @return bool True if the action was performed.
     */
    protected function taskListmedia()
    {
        if ($this->view !== 'media') {
            return false;
        }

        if (!$this->authorizeTask('list media', ['admin.pages', 'admin.pages.read', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $media = $this->getMedia();
        if (!$media) {
            $this->admin->json_response = [
                'status' => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.NO_PAGE_FOUND')
            ];

            return false;
        }

        $media_list = [];
        /**
         * @var string $name
         * @var Medium|ImageMedium $medium
         */
        foreach ($media->all() as $name => $medium) {

            $metadata = [];
            $img_metadata = $medium->metadata();
            if ($img_metadata) {
                $metadata = $img_metadata;
            }

            // Get original name
            /** @var ImageMedium $source */
            $source = method_exists($medium, 'higherQualityAlternative') ? $medium->higherQualityAlternative() : null;

            $media_list[$name] = [
                'url' => $medium->display($medium->get('extension') === 'svg' ? 'source' : 'thumbnail')->cropZoom(400, 300)->url(),
                'size' => $medium->get('size'),
                'metadata' => $metadata,
                'original' => $source ? $source->get('filename') : null
            ];
        }

        $this->admin->json_response = ['status' => 'success', 'results' => $media_list];

        return true;
    }

    /**
     * Handles adding a media file to a page.
     *
     * Used by pagemedia field. Works only within legacy pages.
     *
     * @return bool True if the action was performed.
     */
    protected function taskAddmedia()
    {
        if ($this->view !== 'media') {
            return false;
        }

        if (!$this->authorizeTask('add media', ['admin.pages', 'admin.pages.update', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        /** @var Config $config */
        $config = $this->grav['config'];

        if (empty($_FILES)) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.EXCEEDED_POSTMAX_LIMIT')
            ];

            return false;
        }

        if (!isset($_FILES['file']['error']) || is_array($_FILES['file']['error'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INVALID_PARAMETERS')
            ];

            return false;
        }

        // Check $_FILES['file']['error'] value.
        switch ($_FILES['file']['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.NO_FILES_SENT')
                ];

                return false;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.EXCEEDED_FILESIZE_LIMIT')
                ];

                return false;
            case UPLOAD_ERR_NO_TMP_DIR:
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.UPLOAD_ERR_NO_TMP_DIR')
                ];

                return false;
            default:
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.UNKNOWN_ERRORS')
                ];

                return false;
        }

        $filename = $_FILES['file']['name'];

        // Handle bad filenames.
        if (!Utils::checkFilename($filename)) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => sprintf($this->admin::translate('PLUGIN_ADMIN.FILEUPLOAD_UNABLE_TO_UPLOAD'),
                    htmlspecialchars($filename, ENT_QUOTES | ENT_HTML5, 'UTF-8'), 'Bad filename')
            ];

            return false;
        }

        // You should also check filesize here.
        $grav_limit = Utils::getUploadLimit();
        if ($grav_limit > 0 && $_FILES['file']['size'] > $grav_limit) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.EXCEEDED_GRAV_FILESIZE_LIMIT')
            ];

            return false;
        }


        // Check extension
        $extension = strtolower(Utils::pathinfo($filename, PATHINFO_EXTENSION));

        // If not a supported type, return
        if (!$extension || !$config->get("media.types.{$extension}")) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.UNSUPPORTED_FILE_TYPE') . ': ' . $extension
            ];

            return false;
        }

        $page = $this->admin->page($this->route);
        $media = $page ? $this->getMedia($page) : null;
        if (!$media) {
            $this->admin->json_response = [
                'status' => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.NO_PAGE_FOUND')
            ];

            return false;
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->grav['locator'];
        $path = $media->getPath();
        if ($locator->isStream($path)) {
            $path = $locator->findResource($path, true, true);
        }

        // Special Sanitization for SVG
        if (Utils::contains($extension, 'svg', false)) {
            Security::sanitizeSVG($_FILES['file']['tmp_name']);
        }

        // Upload it
        if (!move_uploaded_file($_FILES['file']['tmp_name'], sprintf('%s/%s', $path, $filename))) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.FAILED_TO_MOVE_UPLOADED_FILE')
            ];

            return false;
        }

        Cache::clearCache('invalidate');

        // Add metadata if needed
        $include_metadata = Grav::instance()['config']->get('system.media.auto_metadata_exif', false);
        $basename = str_replace(['@3x', '@2x'], '', Utils::pathinfo($filename, PATHINFO_BASENAME));

        $metadata = [];

        if ($include_metadata && isset($media[$basename])) {
            $img_metadata = $media[$basename]->metadata();
            if ($img_metadata) {
                $metadata = $img_metadata;
            }
        }

        // DEPRECATED: page
        $this->grav->fireEvent('onAdminAfterAddMedia', new Event(['object' => $page, 'page' => $page]));

        $this->admin->json_response = [
            'status'  => 'success',
            'message' => $this->admin::translate('PLUGIN_ADMIN.FILE_UPLOADED_SUCCESSFULLY'),
            'metadata' => $metadata,
        ];

        return true;
    }

    /**
     * Request: POST .json/task:compileScss (AJAX call)
     *
     * @return bool
     */
    protected function taskCompileScss()
    {
        if (!$this->authorizeTask('compile scss', ['admin.plugins', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $default_scheme = $this->grav['config']->get('plugins.admin.whitelabel.color_scheme');

        $preview = $this->post['preview'] ?? false;
        $data = ['color_scheme' => $this->data['whitelabel']['color_scheme'] ?? $default_scheme];
        $output_file = $preview ? 'admin-preset.css' : 'admin-preset__tmp.css';

        $options = [
            'input' => 'plugin://admin/themes/grav/scss/preset.scss',
            'output' => 'asset://' .$output_file
        ];

        [$compile_status, $msg] = $this->grav['admin-whitelabel']->compilePresetScss($data, $options);

        $json_response = [
            'status'  => $compile_status ? 'success' : 'error',
            'message' => ($preview ? 'Preview ' : 'SCSS ') . $msg,
            'files' => [
                'color_scheme' => Utils::url($options['output'])
            ]
        ];

        $this->sendJsonResponse($json_response);
    }

    /**
     * Request: POST .json/task:exportScss (AJAX call)
     *
     * @return bool
     */
    protected function taskExportScss()
    {
        if (!$this->authorizeTask('export scss', ['admin.plugins', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $data = ['color_scheme' => $this->data['whitelabel']['color_scheme'] ?? null];
        $name = empty($this->data['whitelabel']['color_scheme']['name']) ? 'admin-theme-export' : \Grav\Plugin\Admin\Utils::slug($this->data['whitelabel']['color_scheme']['name']);

        $location  = 'asset://' . $name . '.yaml';

        [$status, $msg] = $this->grav['admin-whitelabel']->exportPresetScsss($data, $location);

        $json_response = [
            'status'  => $status ? 'success' : 'error',
            'message' => $msg,
            'files' => [
                'download' => Utils::url($location)
            ]
        ];

        $this->sendJsonResponse($json_response);
    }

    /**
     * Handles deleting a media file from a page.
     *
     * Used by pagemedia field.
     *
     * @return bool True if the action was performed.
     */
    protected function taskDelmedia()
    {
        if ($this->view !== 'media') {
            return false;
        }

        if (!$this->authorizeTask('delete media', ['admin.pages', 'admin.pages.update', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $page = $this->admin->page($this->route);
        $media = $page ? $this->getMedia($page) : null;
        if (null === $media) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.NO_PAGE_FOUND')
            ];

            return false;
        }

        $filename = !empty($this->post['filename']) ? Utils::basename($this->post['filename']) : null;

        // Handle bad filenames.
        if (!$filename || !Utils::checkFilename($filename)) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.NO_FILE_FOUND')
            ];

            return false;
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->grav['locator'];

        $targetPath = $media->getPath() . '/' . $filename;
        if ($locator->isStream($targetPath)) {
            $targetPath = $locator->findResource($targetPath, true, true);
        }
        $fileParts  = Utils::pathinfo($filename);

        $found = false;

        if (file_exists($targetPath)) {
            $found  = true;
            $result = unlink($targetPath);

            if (!$result) {
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.FILE_COULD_NOT_BE_DELETED') . ': ' . htmlspecialchars($filename, ENT_QUOTES | ENT_HTML5, 'UTF-8')
                ];

                return false;
            }
        }

        // Remove Extra Files
        foreach (scandir($media->getPath(), SCANDIR_SORT_NONE) as $file) {
            if (preg_match("/{$fileParts['filename']}@\d+x\.{$fileParts['extension']}(?:\.meta\.yaml)?$|{$filename}\.meta\.yaml$/", $file)) {

                $targetPath = $media->getPath() . '/' . $file;
                if ($locator->isStream($targetPath)) {
                    $targetPath = $locator->findResource($targetPath, true, true);
                }

                $result = unlink($targetPath);

                if (!$result) {
                    $this->admin->json_response = [
                        'status'  => 'error',
                        'message' => $this->admin::translate('PLUGIN_ADMIN.FILE_COULD_NOT_BE_DELETED') . ': ' . htmlspecialchars($filename, ENT_QUOTES | ENT_HTML5, 'UTF-8')
                    ];

                    return false;
                }

                $found = true;
            }
        }

        Cache::clearCache('invalidate');

        if (!$found) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.FILE_NOT_FOUND') . ': ' . htmlspecialchars($filename, ENT_QUOTES | ENT_HTML5, 'UTF-8')
            ];

            return false;
        }

        // DEPRECATED: page
        $this->grav->fireEvent('onAdminAfterDelMedia', new Event(['object' => $page, 'page' => $page, 'media' => $media, 'filename' => $filename]));

        $this->admin->json_response = [
            'status'  => 'success',
            'message' => $this->admin::translate('PLUGIN_ADMIN.FILE_DELETED') . ': ' . htmlspecialchars($filename, ENT_QUOTES | ENT_HTML5, 'UTF-8')
        ];

        return true;
    }

    /**
     * @param array $data
     * @return array
     */
    protected function getLevelListing($data)
    {
        // Valid types are dir|file|link
        $default_filters =  ['type'=> ['root', 'dir'], 'name' => null, 'extension' => null];

        $pages = $this->admin::enablePages();

        $page_instances = $pages->instances();

        $is_page = $data['page'] ?? true;
        $route = $data['route'] ?? null;
        $leaf_route = $data['leaf_route'] ?? null;
        $sortby = $data['sortby'] ?? 'filename';
        $order = $data['order'] ?? SORT_ASC;
        $initial = $data['initial'] ?? null;
        $filters = isset($data['filters']) ? $default_filters + json_decode($data['filters']) : $default_filters;
        $filter_type = (array) $filters['type'];

        $status = 'error';
        $msg = null;
        $response = [];
        $children = null;
        $sub_route = null;
        $extra = null;
        $root = false;

        // Handle leaf_route
        if ($leaf_route && $route !== $leaf_route) {
            $nodes = explode('/', $leaf_route);
            $sub_route =  '/' . implode('/', array_slice($nodes, 1, $data['level']++));
            $data['route'] = $sub_route;

            [$status, $msg, $children, $extra] = $this->getLevelListing($data);
        }

        // Handle no route, assume page tree root
        if (!$route) {
            $is_page = false;
            $route = $this->grav['locator']->findResource('page://', true);
            $root = true;
        }

        if ($is_page) {
            // Try the path
            /** @var PageInterface $page */
            $page = $pages->get(GRAV_ROOT . $route);

            // Try a real route (like homepage)
            if (is_null($page)) {
                $page = $pages->find($route);
            }

            $path = $page ? $page->path() : null;
        } else {
            // Try a physical path
            if (!Utils::startsWith($route, GRAV_ROOT)) {
                $try_path = GRAV_ROOT . $route;
            } else {
                $try_path = $route;
            }

            $path = file_exists($try_path) ? $try_path : null;
        }

        $blueprintsData = $this->admin->page(true);

        if (null !== $blueprintsData) {
            if (method_exists($blueprintsData, 'blueprints')) {
                $settings = $blueprintsData->blueprints()->schema()->getProperty($data['field']);
            } elseif (method_exists($blueprintsData, 'getBlueprint')) {
                $settings = $blueprintsData->getBlueprint()->schema()->getProperty($data['field']);
            }

            $filters = array_merge([], $filters, ($settings['filters'] ?? []));
            $filter_type = $filters['type'] ?? $filter_type;
        }


        if ($path) {
            $status = 'success';
            $msg = 'PLUGIN_ADMIN.PAGE_ROUTE_FOUND';
            foreach (new \DirectoryIterator($path) as $fileInfo) {
                $fileName = $fileInfo->getFilename();
                $filePath = str_replace('\\', '/', $fileInfo->getPathname());

                if (($fileInfo->isDot() && $fileName !== '.' && $initial) || (Utils::startsWith($fileName, '.') && strlen($fileName) > 1)) {
                    continue;
                }

                if ($fileInfo->isDot()) {
                    if ($root) {
                        $payload = [
                            'name' => '<root>',
                            'value' => '',
                            'item-key' => '',
                            'filename' => '.',
                            'extension' => '',
                            'type' => 'root',
                            'modified' => $fileInfo->getMTime(),
                            'size' => 0,
                            'has-children' => false
                        ];
                    } else {
                        continue;
                    }
                } else {
                    $file_page = $page_instances[$filePath] ?? null;
                    $file_path = Utils::replaceFirstOccurrence(GRAV_ROOT, '', $filePath);
                    $type = $fileInfo->getType();

                    $child_path = $file_page ? $file_page->path() : $filePath;
                    $count_children = Folder::countChildren($child_path);

                    $payload = [
                        'name' => $file_page ? $file_page->title() : $fileName,
                        'value' => $file_page ? $file_page->rawRoute() : $file_path,
                        'item-key' => Utils::basename($file_page ? $file_page->route() : $file_path),
                        'filename' => $fileName,
                        'extension' => $type === 'dir' ? '' : $fileInfo->getExtension(),
                        'type' => $type,
                        'modified' => $fileInfo->getMTime(),
                        'size' => $count_children,
                        'symlink' => false,
                        'has-children' => $count_children > 0
                    ];
                }

                // Fix for symlink
                if ($payload['type'] === 'link') {
                    $payload['symlink'] = true;
                    $physical_path = $fileInfo->getRealPath();
                    $payload['type'] = is_dir($physical_path) ? 'dir' : 'file';
                }

                // filter types
                if ($filters['type']) {
                    if (!in_array($payload['type'], $filter_type)) {
                        continue;
                    }
                }

                // Simple filter for name or extension
                if (($filters['name'] && Utils::contains($payload['basename'], $filters['name'])) ||
                    ($filters['extension'] && Utils::contains($payload['extension'], $filters['extension']))) {
                    continue;
                }

                // Add children if any
                if ($filePath === $extra && is_array($children)) {
                    $payload['children'] = array_values($children);
                }

                $response[] = $payload;
            }
        } else {
            $msg = 'PLUGIN_ADMIN.PAGE_ROUTE_NOT_FOUND';
        }

        // Sorting
        $response = Utils::sortArrayByKey($response, $sortby, $order);

        $temp_array = [];
        foreach ($response as $index => $item) {
            $temp_array[$item['type']][$index] = $item;
        }

        $sorted = Utils::sortArrayByArray($temp_array, $filter_type);
        $response = Utils::arrayFlatten($sorted);

        return [$status, $this->admin::translate($msg ?? 'PLUGIN_ADMIN.NO_ROUTE_PROVIDED'), $response, $path];
    }

    /**
     * Get page media.
     *
     * @param PageInterface|null $page
     * @return Media|null
     */
    public function getMedia(PageInterface $page = null)
    {
        $page = $page ?? $this->admin->page($this->route);
        if (!$page) {
            return null;
        }

        $this->uri = $this->uri ?? $this->grav['uri'];

        $field = (string)$this->uri->post('field', '');
        $order = $this->uri->post('order') ?: null;
        if ($order && is_string($order)) {
            $order = array_map('trim', explode(',', $order));
        }

        $blueprints = $page->blueprints();
        $settings = $this->getMediaFieldSettings($blueprints, $field);
        $path = $settings['destination'] ?? $page->path();

        return $path ? new Media($path, $order) : null;
    }

    /**
     * @param Data\Blueprint|null $blueprint
     * @param string $field
     * @return array|null
     */
    protected function getMediaFieldSettings(?Data\Blueprint $blueprint, string $field): ?array
    {
        $schema = $blueprint ? $blueprint->schema() : null;
        if (!$schema || $field === '') {
            return null;
        }

        $settings = is_object($schema) ? (array)$schema->getProperty($field) : null;
        if (null === $settings) {
            return null;
        }

        if (empty($settings['destination']) || \in_array($settings['destination'], ['@self', 'self@', '@self@'], true)) {
            unset($settings['destination']);
        }

        return $settings + ['accept' => '*', 'limit' => 1000];
    }

    /**
     * @return string
     */
    protected function getDataType()
    {
        return trim("{$this->view}/{$this->admin->route}", '/');
    }

    /**
     * Gets the configuration data for a given view & post
     *
     * @param array $data
     * @return object
     */
    protected function prepareData(array $data)
    {
        $type = $this->getDataType();

        return $this->admin->data($type, $data);
    }

    /**
     * Prepare a page to be stored: update its folder, name, template, header and content
     *
     * @param PageInterface          $page
     * @param bool                   $clean_header
     * @param string                 $languageCode
     * @return void
     */
    protected function preparePage(PageInterface $page, $clean_header = false, $languageCode = ''): void
    {
        $input = (array)$this->data;

        $this->admin::enablePages();

        if (isset($input['folder']) && $input['folder'] !== $page->value('folder')) {
            $order    = $page->value('order');
            $ordering = $order ? sprintf('%02d.', $order) : '';
            $page->folder($ordering . $input['folder']);
        }

        if (isset($input['name']) && !empty($input['name'])) {
            $type = strtolower($input['name']);
            $page->template($type);
            $name = preg_replace('|.*/|', '', $type);

            /** @var Language $language */
            $language = $this->grav['language'];
            if ($language->enabled()) {
                $languageCode = $languageCode ?: $language->getLanguage();
                if ($languageCode) {
                    $isDefault = $languageCode === $language->getDefault();
                    $includeLang = !$isDefault || (bool)$this->grav['config']->get('system.languages.include_default_lang_file_extension', true);
                    if (!$includeLang) {
                        // Check if the language specific file exists; use it if it does.
                        $includeLang = file_exists("{$page->path()}/{$name}.{$languageCode}.md");
                    }
                    // Keep existing .md file if we're updating default language, otherwise always append the language.
                    if ($includeLang) {
                        $name .= '.' . $languageCode;
                    }
                }
            }

            $name .= '.md';
            $page->name($name);
        }

        // Special case for Expert mode: build the raw, unset content
        if (isset($input['frontmatter'], $input['content'])) {
            $page->raw("---\n" . (string)$input['frontmatter'] . "\n---\n" . (string)$input['content']);
            unset($input['content']);
        // Handle header normally
        } elseif (isset($input['header'])) {
            $header = $input['header'];

            foreach ($header as $key => $value) {
                if ($key === 'metadata' && is_array($header[$key])) {
                    foreach ($header['metadata'] as $key2 => $value2) {
                        if (isset($input['toggleable_header']['metadata'][$key2]) && !$input['toggleable_header']['metadata'][$key2]) {
                            $header['metadata'][$key2] = '';
                        }
                    }
                } elseif ($key === 'taxonomy' && is_array($header[$key])) {
                    foreach ($header[$key] as $taxkey => $taxonomy) {
                        if (is_array($taxonomy) && \count($taxonomy) === 1 && trim($taxonomy[0]) === '') {
                            unset($header[$key][$taxkey]);
                        }
                    }
                } else {
                    if (isset($input['toggleable_header'][$key]) && !$input['toggleable_header'][$key]) {
                        $header[$key] = null;
                    }
                }
            }
            if ($clean_header) {
                $header = Utils::arrayFilterRecursive($header, function ($k, $v) {
                    return !(null === $v || $v === '');
                });
            }
            $page->header((object)$header);
            $page->frontmatter(Yaml::dump((array)$page->header(), 20));
        }
        // Fill content last because it also renders the output.
        if (isset($input['content'])) {
            $page->rawMarkdown((string)$input['content']);
        }
    }

    /**
     * Find the first available $item ('slug' | 'folder') for a page
     * Used when copying a page, to determine the first available slot
     *
     * @param string        $item
     * @param PageInterface $page
     * @return string The first available slot
     */
    protected function findFirstAvailable($item, PageInterface $page)
    {
        $parent = $page->parent();
        if (!$parent || !$parent->children()) {
            return $page->{$item}();
        }

        $withoutPrefix = function ($string) {
            $match = preg_split('/^[0-9]+\./u', $string, 2, PREG_SPLIT_DELIM_CAPTURE);

            return $match[1] ?? $match[0];
        };

        $withoutPostfix = function ($string) {
            $match = preg_split('/-(\d+)$/', $string, 2, PREG_SPLIT_DELIM_CAPTURE);

            return $match[0];
        };

        /* $appendedNumber = function ($string) {
            $match  = preg_split('/-(\d+)$/', $string, 2, PREG_SPLIT_DELIM_CAPTURE);
            $append = (isset($match[1]) ? (int)$match[1] + 1 : 2);

            return $append;
        };*/

        $highest                   = 1;
        $siblings                  = $parent->children();
        $findCorrectAppendedNumber = function ($item, $page_item, $highest) use (
            $siblings,
            &$findCorrectAppendedNumber,
            &$withoutPrefix
        ) {
            foreach ($siblings as $sibling) {
                if ($withoutPrefix($sibling->{$item}()) == ($highest === 1 ? $page_item : $page_item . '-' . $highest)) {
                    $highest = $findCorrectAppendedNumber($item, $page_item, $highest + 1);

                    return $highest;
                }
            }

            return $highest;
        };

        $base = $withoutPrefix($withoutPostfix($page->$item()));

        $return  = $base;
        $highest = $findCorrectAppendedNumber($item, $base, $highest);

        if ($highest > 1) {
            $return .= '-' . $highest;
        }

        return $return;
    }

    /**
     * @param string $frontmatter
     * @return bool
     */
    public function checkValidFrontmatter($frontmatter)
    {
        try {
            Yaml::parse($frontmatter);
        } catch (\RuntimeException $e) {
            return false;
        }

        return true;
    }

    /**
     * The what should be the new filename when saving as a new language
     *
     * @param string $current_filename the current file name, including .md. Example: default.en.md
     * @param string $language         The new language it will be saved as. Example: 'it' or 'en-GB'.
     * @return string The new filename. Example: 'default.it'
     */
    public function determineFilenameIncludingLanguage($current_filename, $language)
    {
        $ext = '.md';
        $filename = substr($current_filename, 0, -strlen($ext));
        $languages_enabled = $this->grav['config']->get('system.languages.supported', []);

        $parts = explode('.', trim($filename, '.'));
        $lang = array_pop($parts);

        if ($lang === $language) {
            return $filename . $ext;
        }

        if (in_array($lang, $languages_enabled, true)) {
            $filename = implode('.', $parts);
        }

        return $filename . '.' . $language . $ext;
    }

    /**
     * Get the next available ordering number in a folder
     *
     * @param string $path
     * @return string the correct order string to prepend
     */
    public static function getNextOrderInFolder($path)
    {
        $files = Folder::all($path, ['recursive' => false]);

        $highestOrder = 0;
        foreach ($files as $file) {
            preg_match(PAGE_ORDER_PREFIX_REGEX, $file, $order);

            if (isset($order[0])) {
                $theOrder = (int)trim($order[0], '.');
            } else {
                $theOrder = 0;
            }

            if ($theOrder >= $highestOrder) {
                $highestOrder = $theOrder;
            }
        }

        $orderOfNewFolder = $highestOrder + 1;

        if ($orderOfNewFolder < 10) {
            $orderOfNewFolder = '0' . $orderOfNewFolder;
        }

        return $orderOfNewFolder;
    }

    /**
     * Used in 3rd party editors (e.g. next-gen).
     *
     * @return ResponseInterface|false
     */
    protected function taskConvertUrls()
    {
        if (!$this->authorizeTask('access page', ['admin.pages', 'admin.pages.list', 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        $request = $this->getRequest();
        $data = $request->getParsedBody();
        $converted_links = [];
        $converted_images = [];
        $status = 'success';
        $message = 'All links converted';

        $data['route'] = isset($data['route']) ? base64_decode($data['route']) : null;
        $data['data'] = json_decode($data['data'] ?? '{}', true);

        // use the route if passed, else use current page in admin as reference
        $page_route = $data['route'] ?? $this->admin->page(true);

        /** @var PageInterface */
        $pages = $this->admin::enablePages();
        $page = $pages->find($page_route);

        if (!$page) {
            throw new RequestException($request,'Page Not Found', 404);
        }


        if (!isset($data['data'])) {
            throw new RequestException($request, 'Bad Request', 400);
        }

        foreach ($data['data']['a'] ?? [] as $link) {
            $converted_links[$link] = Excerpts::processLinkHtml($link, $page);
        }

        foreach ($data['data']['img'] ?? [] as $image) {
            $converted_images[$image] = Excerpts::processImageHtml($image, $page);
        }

        $json = [
            'status'  => $status,
            'message' => $message,
            'data' => ['links' => $converted_links, 'images' => $converted_images]
        ];

        return $this->createJsonResponse($json, 200);
    }
}
