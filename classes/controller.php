<?php
namespace Grav\Plugin;

use Grav\Common\Cache;
use Grav\Common\Config\Config;
use Grav\Common\File\CompiledYamlFile;
use Grav\Common\Filesystem\Folder;
use Grav\Common\GPM\Installer;
use Grav\Common\Grav;
use Grav\Common\Data;
use Grav\Common\Page\Page;
use Grav\Common\Page\Pages;
use Grav\Common\Page\Collection;
use Grav\Common\Plugin;
use Grav\Common\Theme;
use Grav\Common\User\User;
use Grav\Common\Utils;
use Grav\Common\Backup\ZipBackup;
use RocketTheme\Toolbox\Event\Event;
use RocketTheme\Toolbox\File\File;
use RocketTheme\Toolbox\File\JsonFile;
use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Yaml;

/**
 * Class AdminController
 * @package Grav\Plugin
 */
class AdminController
{
    /**
     * @var Grav
     */
    public $grav;

    /**
     * @var string
     */
    public $view;

    /**
     * @var string
     */
    public $task;

    /**
     * @var string
     */
    public $route;

    /**
     * @var array
     */
    public $post;

    /**
     * @var array|null
     */
    public $data;

    /**
     * @var Admin
     */
    protected $admin;

    /**
     * @var string
     */
    protected $redirect;

    /**
     * @var int
     */
    protected $redirectCode;

    protected $upload_errors = [
        0 => "There is no error, the file uploaded with success",
        1 => "The uploaded file exceeds the max upload size",
        2 => "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML",
        3 => "The uploaded file was only partially uploaded",
        4 => "No file was uploaded",
        6 => "Missing a temporary folder",
        7 => "Failed to write file to disk",
        8 => "A PHP extension stopped the file upload"
    ];

    /**
     * @param Grav   $grav
     * @param string $view
     * @param string $task
     * @param string $route
     * @param array  $post
     */
    public function __construct(Grav $grav, $view, $task, $route, $post)
    {
        $this->grav = $grav;
        $this->view = $view;
        $this->task = $task ? $task : 'display';
        if (isset($post['data'])) {
            $this->data = $this->getPost($post['data']);
            unset($post['data']);
        } else {
            // Backwards compatibility for Form plugin <= 1.2
            $this->data = $this->getPost($post);
        }
        $this->post = $this->getPost($post);
        $this->route = $route;
        $this->admin = $this->grav['admin'];
    }

    /**
     * Performs a task.
     *
     * @return bool True if the action was performed successfully.
     */
    public function execute()
    {
        if (method_exists('Grav\Common\Utils', 'getNonce')) {
            if (strtolower($_SERVER['REQUEST_METHOD']) == 'post') {
                if (isset($this->post['admin-nonce'])) {
                    $nonce = $this->post['admin-nonce'];
                } else {
                    $nonce = $this->grav['uri']->param('admin-nonce');
                }

                if (!$nonce || !Utils::verifyNonce($nonce, 'admin-form')) {
                    if ($this->task == 'addmedia') {

                        $message = sprintf($this->admin->translate('PLUGIN_ADMIN.FILE_TOO_LARGE', null, true),
                            ini_get('post_max_size'));

                        //In this case it's more likely that the image is too big than POST can handle. Show message
                        $this->admin->json_response = [
                            'status'  => 'error',
                            'message' => $message
                        ];

                        return false;
                    }

                    $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'), 'error');
                    $this->admin->json_response = [
                        'status'  => 'error',
                        'message' => $this->admin->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN')
                    ];

                    return false;
                }
                unset($this->post['admin-nonce']);
            } else {
                if ($this->task == 'logout') {
                    $nonce = $this->grav['uri']->param('logout-nonce');
                    if (!isset($nonce) || !Utils::verifyNonce($nonce, 'logout-form')) {
                        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'),
                            'error');
                        $this->admin->json_response = [
                            'status'  => 'error',
                            'message' => $this->admin->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN')
                        ];

                        return false;
                    }
                } else {
                    $nonce = $this->grav['uri']->param('admin-nonce');
                    if (!isset($nonce) || !Utils::verifyNonce($nonce, 'admin-form')) {
                        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'),
                            'error');
                        $this->admin->json_response = [
                            'status'  => 'error',
                            'message' => $this->admin->translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN')
                        ];

                        return false;
                    }
                }
            }
        }

        $success = false;
        $method = 'task' . ucfirst($this->task);

        if (method_exists($this, $method)) {
            try {
                $success = call_user_func([$this, $method]);
            } catch (\RuntimeException $e) {
                $success = true;
                $this->admin->setMessage($e->getMessage(), 'error');
            }

            // Grab redirect parameter.
            $redirect = isset($this->post['_redirect']) ? $this->post['_redirect'] : null;
            unset($this->post['_redirect']);

            // Redirect if requested.
            if ($redirect) {
                $this->setRedirect($redirect);
            }
        }

        return $success;
    }

    /**
     * Redirect to the route stored in $this->redirect
     */
    public function redirect()
    {
        if (!$this->redirect) {
            return;
        }

        $base = $this->admin->base;
        $this->redirect = '/' . ltrim($this->redirect, '/');
        $multilang = $this->isMultilang();

        $redirect = '';
        if ($multilang) {
            // if base path does not already contain the lang code, add it
            $langPrefix = '/' . $this->grav['session']->admin_lang;
            if (!Utils::startsWith($base, $langPrefix . '/')) {
                $base = $langPrefix . $base;
            }

            // now the first 4 chars of base contain the lang code.
            // if redirect path already contains the lang code, and is != than the base lang code, then use redirect path as-is
            if (Utils::pathPrefixedByLangCode($base) && Utils::pathPrefixedByLangCode($this->redirect) && substr($base,
                    0, 4) != substr($this->redirect, 0, 4)
            ) {
                $redirect = $this->redirect;
            } else {
                if (!Utils::startsWith($this->redirect, $base)) {
                    $this->redirect = $base . $this->redirect;
                }
            }

        } else {
            if (!Utils::startsWith($this->redirect, $base)) {
                $this->redirect = $base . $this->redirect;
            }
        }

        if (!$redirect) {
            $redirect = $this->redirect;
        }

        $this->grav->redirect($redirect, $this->redirectCode);
    }

    /**
     * Return true if multilang is active
     *
     * @return bool True if multilang is active
     */
    protected function isMultilang()
    {
        return count($this->grav['config']->get('system.languages.supported', [])) > 1;
    }

    /**
     * Handle login.
     *
     * @return bool True if the action was performed.
     */
    protected function taskLogin()
    {
        $this->data['username'] = strip_tags(strtolower($this->data['username']));
        if ($this->admin->authenticate($this->data, $this->post)) {
            // should never reach here, redirects first
        } else {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.LOGIN_FAILED'), 'error');
        }

        return true;
    }

    /**
     * Handle logout.
     *
     * @return bool True if the action was performed.
     */
    protected function taskLogout()
    {
        $language = $this->grav['user']->authenticated ? $this->grav['user']->language : ($this->grav['language']->getLanguage() ?: 'en');

        $this->admin->session()->invalidate()->start();
        $this->setRedirect('/logout/lang:' . $language);

        return true;
    }

    /**
     * Toggle the gpm.releases setting
     */
    protected function taskGpmRelease()
    {
        if (!$this->authorizeTask('configuration', ['admin.configuration', 'admin.super'])) {
            return false;
        }

        // Default release state
        $release = 'stable';
        $reload = false;

        // Get the testing release value if set
        if ($this->post['release'] == 'testing') {
            $release = 'testing';
        }

        $config = $this->grav['config'];
        $current_release = $config->get('system.gpm.releases');

        // If the releases setting is different, save it in the system config
        if ($current_release != $release) {
            $data = new Data\Data($config->get('system'));
            $data->set('gpm.releases', $release);

            // Get the file location
            $file = CompiledYamlFile::instance($this->grav['locator']->findResource("config://system.yaml"));
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
     * Keep alive
     */
    protected function taskKeepAlive()
    {
        exit();
    }

    /**
     * Handle getting a new package dependencies needed to be installed
     *
     * @return bool
     */
    protected function taskGetPackagesDependencies()
    {
        $data = $this->post;
        $packages = isset($data['packages']) ? $data['packages'] : '';
        $packages = (array)$packages;
        try {
            $this->admin->checkPackagesCanBeInstalled($packages);
            $dependencies = $this->admin->getDependenciesNeededToInstall($packages);
        } catch (\Exception $e) {
            $this->admin->json_response = ['status' => 'error', 'message' => $e->getMessage()];

            return;
        }

        $this->admin->json_response = ['status' => 'success', 'dependencies' => $dependencies];

        return true;
    }

    protected function taskInstallDependenciesOfPackages()
    {
        $data = $this->post;
        $packages = isset($data['packages']) ? $data['packages'] : '';
        $packages = (array)$packages;

        $type = isset($data['type']) ? $data['type'] : '';

        if (!$this->authorizeTask('install ' . $type, ['admin.' . $type, 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        require_once __DIR__ . '/gpm.php';

        try {
            $dependencies = $this->admin->getDependenciesNeededToInstall($packages);
        } catch (\Exception $e) {
            $this->admin->json_response = ['status' => 'error', 'message' => $e->getMessage()];

            return;
        }

        $result = \Grav\Plugin\Admin\Gpm::install(array_keys($dependencies), ['theme' => ($type == 'theme')]);

        if ($result) {
            $this->admin->json_response = ['status' => 'success', 'message' => 'Dependencies installed successfully'];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.INSTALLATION_FAILED')
            ];
        }

        return true;
    }

    protected function taskInstallPackage()
    {
        $data = $this->post;
        $package = isset($data['package']) ? $data['package'] : '';
        $type = isset($data['type']) ? $data['type'] : '';

        if (!$this->authorizeTask('install ' . $type, ['admin.' . $type, 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        require_once __DIR__ . '/gpm.php';

        $result = false;

        try {
            $result = \Grav\Plugin\Admin\Gpm::install($package, ['theme' => ($type == 'theme')]);
        } catch (\Exception $e) {
            $this->admin->json_response = ['status' => 'error', 'message' => $e->getMessage()];

            return;
        }

        if ($result) {
            $this->admin->json_response = [
                'status'  => 'success',
                'message' => $this->admin->translate(is_string($result) ? $result : sprintf($this->admin->translate('PLUGIN_ADMIN.PACKAGE_X_INSTALLED_SUCCESSFULLY',
                    null, true), $package))
            ];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.INSTALLATION_FAILED')
            ];
        }

        return true;
    }

    /**
     * Handle removing a package
     *
     * @return bool
     */
    protected function taskRemovePackage()
    {
        $data = $this->post;
        $package = isset($data['package']) ? $data['package'] : '';
        $type = isset($data['type']) ? $data['type'] : '';

        if (!$this->authorizeTask('uninstall ' . $type, ['admin.' . $type, 'admin.super'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK')
            ];

            return false;
        }

        require_once __DIR__ . '/gpm.php';

        //check if there are packages that have this as a dependency. Abort and show which ones
        $dependent_packages = $this->admin->getPackagesThatDependOnPackage($package);
        if (count($dependent_packages) > 0) {
            if (count($dependent_packages) > 1) {
                $message = "The installed packages <cyan>" . implode('</cyan>, <cyan>',
                        $dependent_packages) . "</cyan> depends on this package. Please remove those first.";
            } else {
                $message = "The installed package <cyan>" . implode('</cyan>, <cyan>',
                        $dependent_packages) . "</cyan> depends on this package. Please remove it first.";
            }

            $this->admin->json_response = ['status' => 'error', 'message' => $message];

            return;
        }

        $result = false;

        try {
            $dependencies = $this->admin->dependenciesThatCanBeRemovedWhenRemoving($package);
            $result = \Grav\Plugin\Admin\Gpm::uninstall($package, []);
        } catch (\Exception $e) {
            $this->admin->json_response = ['status' => 'error', 'message' => $e->getMessage()];

            return;
        }

        if ($result) {
            $this->admin->json_response = [
                'status'       => 'success',
                'dependencies' => $dependencies,
                'message'      => $this->admin->translate(is_string($result) ? $result : 'PLUGIN_ADMIN.UNINSTALL_SUCCESSFUL')
            ];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.UNINSTALL_FAILED')
            ];
        }

        return true;
    }

    /**
     * Handle the email password recovery procedure.
     *
     * @return bool True if the action was performed.
     */
    protected function taskForgot()
    {
        $param_sep = $this->grav['config']->get('system.param_sep', ':');
        $post = $this->post;
        $data = $this->data;

        $username = isset($data['username']) ? strip_tags(strtolower($data['username'])) : '';
        $user = !empty($username) ? User::load($username) : null;

        if (!isset($this->grav['Email'])) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.FORGOT_EMAIL_NOT_CONFIGURED'), 'error');
            $this->setRedirect($post['redirect']);

            return true;
        }

        if (!$user || !$user->exists()) {
            $this->admin->setMessage($this->admin->translate([
                'PLUGIN_ADMIN.FORGOT_USERNAME_DOES_NOT_EXIST',
                $username
            ]), 'error');
            $this->setRedirect($post['redirect']);

            return true;
        }

        if (empty($user->email)) {
            $this->admin->setMessage($this->admin->translate([
                'PLUGIN_ADMIN.FORGOT_CANNOT_RESET_EMAIL_NO_EMAIL',
                $username
            ]), 'error');
            $this->setRedirect($post['redirect']);

            return true;
        }

        $token = md5(uniqid(mt_rand(), true));
        $expire = time() + 604800; // next week

        $user->reset = $token . '::' . $expire;
        $user->save();

        $author = $this->grav['config']->get('site.author.name', '');
        $fullname = $user->fullname ?: $username;
        $reset_link = rtrim($this->grav['uri']->rootUrl(true), '/') . '/' . trim($this->admin->base,
                '/') . '/reset/task' . $param_sep . 'reset/user' . $param_sep . $username . '/token' . $param_sep . $token . '/admin-nonce' . $param_sep . Utils::getNonce('admin-form');

        $sitename = $this->grav['config']->get('site.title', 'Website');
        $from = $this->grav['config']->get('plugins.email.from');

        if (empty($from)) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.FORGOT_EMAIL_NOT_CONFIGURED'), 'error');
            $this->setRedirect($post['redirect']);

            return true;
        }

        $to = $user->email;

        $subject = $this->admin->translate(['PLUGIN_ADMIN.FORGOT_EMAIL_SUBJECT', $sitename]);
        $content = $this->admin->translate([
            'PLUGIN_ADMIN.FORGOT_EMAIL_BODY',
            $fullname,
            $reset_link,
            $author,
            $sitename
        ]);

        $body = $this->grav['twig']->processTemplate('email/base.html.twig', ['content' => $content]);

        $message = $this->grav['Email']->message($subject, $body, 'text/html')->setFrom($from)->setTo($to);

        $sent = $this->grav['Email']->send($message);

        if ($sent < 1) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.FORGOT_FAILED_TO_EMAIL'), 'error');
        } else {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.FORGOT_INSTRUCTIONS_SENT_VIA_EMAIL'),
                'info');
        }

        $this->setRedirect('/');

        return true;
    }

    /**
     * Handle the reset password action.
     *
     * @return bool True if the action was performed.
     */
    public function taskReset()
    {
        $data = $this->data;

        if (isset($data['password'])) {
            $username = isset($data['username']) ? strip_tags(strtolower($data['username'])) : null;
            $user = !empty($username) ? User::load($username) : null;
            $password = isset($data['password']) ? $data['password'] : null;
            $token = isset($data['token']) ? $data['token'] : null;

            if (!empty($user) && $user->exists() && !empty($user->reset)) {
                list($good_token, $expire) = explode('::', $user->reset);

                if ($good_token === $token) {
                    if (time() > $expire) {
                        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_LINK_EXPIRED'), 'error');
                        $this->setRedirect('/forgot');

                        return true;
                    }

                    unset($user->hashed_password);
                    unset($user->reset);
                    $user->password = $password;

                    $user->validate();
                    $user->filter();
                    $user->save();

                    $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_PASSWORD_RESET'), 'info');
                    $this->setRedirect('/');

                    return true;
                }
            }

            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_INVALID_LINK'), 'error');
            $this->setRedirect('/forgot');

            return true;

        } else {
            $user = $this->grav['uri']->param('user');
            $token = $this->grav['uri']->param('token');

            if (empty($user) || empty($token)) {
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_INVALID_LINK'), 'error');
                $this->setRedirect('/forgot');

                return true;
            } else {
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_NEW_PASSWORD'), 'info');
            }

            $this->admin->forgot = ['username' => $user, 'token' => $token];
        }

        return true;
    }

    /**
     * Clear the cache.
     *
     * @return bool True if the action was performed.
     */
    protected function taskClearCache()
    {
        if (!$this->authorizeTask('clear cache', ['admin.cache', 'admin.super'])) {
            return false;
        }

        // get optional cleartype param
        $clear_type = $this->grav['uri']->param('cleartype');

        if ($clear_type) {
            $clear = $clear_type;
        } else {
            $clear = 'standard';
        }

        $results = Cache::clearCache($clear);
        if (count($results) > 0) {
            $this->admin->json_response = [
                'status'  => 'success',
                'message' => $this->admin->translate('PLUGIN_ADMIN.CACHE_CLEARED') . ' <br />' . $this->admin->translate('PLUGIN_ADMIN.METHOD') . ': ' . $clear . ''
            ];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.ERROR_CLEARING_CACHE')
            ];
        }

        return true;
    }

    /**
     * Handle the backup action
     *
     * @return bool True if the action was performed.
     */
    protected function taskBackup()
    {
        $param_sep = $this->grav['config']->get('system.param_sep', ':');
        if (!$this->authorizeTask('backup', ['admin.maintenance', 'admin.super'])) {
            return false;
        }

        $download = $this->grav['uri']->param('download');

        if ($download) {
            $file = base64_decode(urldecode($download));
            $backups_root_dir = $this->grav['locator']->findResource('backup://', true);

            if (substr($file, 0, strlen($backups_root_dir)) !== $backups_root_dir) {
                header('HTTP/1.1 401 Unauthorized');
                exit();
            }

            Utils::download($file, true);
        }

        $log = JsonFile::instance($this->grav['locator']->findResource("log://backup.log", true, true));

        try {
            $backup = ZipBackup::backup();
        } catch (\Exception $e) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.AN_ERROR_OCCURRED') . '. ' . $e->getMessage()
            ];

            return true;
        }

        $download = urlencode(base64_encode($backup));
        $url = rtrim($this->grav['uri']->rootUrl(true), '/') . '/' . trim($this->admin->base,
                '/') . '/task' . $param_sep . 'backup/download' . $param_sep . $download . '/admin-nonce' . $param_sep . Utils::getNonce('admin-form');

        $log->content([
            'time'     => time(),
            'location' => $backup
        ]);
        $log->save();

        $this->admin->json_response = [
            'status'  => 'success',
            'message' => $this->admin->translate('PLUGIN_ADMIN.YOUR_BACKUP_IS_READY_FOR_DOWNLOAD') . '. <a href="' . $url . '" class="button">' . $this->admin->translate('PLUGIN_ADMIN.DOWNLOAD_BACKUP') . '</a>',
            'toastr'  => [
                'timeOut'         => 0,
                'extendedTimeOut' => 0,
                'closeButton'     => true
            ]
        ];

        return true;
    }

    /**
     * Handles filtering the page by modular/visible/routable in the pages list.
     */
    protected function taskFilterPages()
    {
        if (!$this->authorizeTask('filter pages', ['admin.pages', 'admin.super'])) {
            return;
        }

        $data = $this->post;

        $flags = !empty($data['flags']) ? array_map('strtolower', explode(',', $data['flags'])) : [];
        $queries = !empty($data['query']) ? explode(',', $data['query']) : [];

        /** @var Collection $collection */
        $collection = $this->grav['pages']->all();

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
                if (in_array('modular', $flags)) {
                    $collection = $collection->modular();
                }

                if (in_array('nonmodular', $flags)) {
                    $collection = $collection->nonModular();
                }

                if (in_array('visible', $flags)) {
                    $collection = $collection->visible();
                }

                if (in_array('nonvisible', $flags)) {
                    $collection = $collection->nonVisible();
                }

                if (in_array('routable', $flags)) {
                    $collection = $collection->routable();
                }

                if (in_array('nonroutable', $flags)) {
                    $collection = $collection->nonRoutable();
                }

                if (in_array('published', $flags)) {
                    $collection = $collection->published();
                }

                if (in_array('nonpublished', $flags)) {
                    $collection = $collection->nonPublished();
                }
            }
            foreach ($pageStates as $pageState) {
                if (($pageState = array_search($pageState, $flags)) !== false) {
                    unset($flags[$pageState]);
                }
            }

            // Filter by page type
            if (count($flags)) {
                $types = [];

                $pageTypes = Pages::pageTypes();
                foreach ($pageTypes as $pageType) {
                    if (($pageType = array_search($pageType, $flags)) !== false) {
                        $types[] = $pageType;
                        unset($flags[$pageType]);
                    }
                }

                if (count($types)) {
                    $collection = $collection->ofOneOfTheseTypes($types);
                }
            }

            // Filter by page type
            if (count($flags)) {
                $accessLevels = $flags;
                $collection = $collection->ofOneOfTheseAccessLevels($accessLevels);
            }
        }

        if (!empty($queries)) {
            foreach ($collection as $page) {
                foreach ($queries as $query) {
                    $query = trim($query);
                    if (stripos($page->getRawContent(), $query) === false && stripos($page->title(),
                            $query) === false
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
            'message' => $this->admin->translate('PLUGIN_ADMIN.PAGES_FILTERED'),
            'results' => $results
        ];
        $this->admin->collection = $collection;
    }

    /**
     * Determines the file types allowed to be uploaded
     *
     * @return bool True if the action was performed.
     */
    protected function taskListmedia()
    {
        if (!$this->authorizeTask('list media', ['admin.pages', 'admin.super'])) {
            return false;
        }

        $page = $this->admin->page(true);

        if (!$page) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.NO_PAGE_FOUND')
            ];

            return false;
        }

        $media_list = [];
        foreach ($page->media()->all() as $name => $media) {
            $media_list[$name] = ['url' => $media->cropZoom(150, 100)->url(), 'size' => $media->get('size')];
        }
        $this->admin->json_response = ['status' => 'success', 'results' => $media_list];

        return true;
    }

    /**
     * Handles adding a media file to a page
     *
     * @return bool True if the action was performed.
     */
    protected function taskAddmedia()
    {
        if (!$this->authorizeTask('add media', ['admin.pages', 'admin.super'])) {
            return false;
        }

        $page = $this->admin->page(true);

        /** @var Config $config */
        $config = $this->grav['config'];

        if (!isset($_FILES['file']['error']) || is_array($_FILES['file']['error'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.INVALID_PARAMETERS')
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
                    'message' => $this->admin->translate('PLUGIN_ADMIN.NO_FILES_SENT')
                ];

                return false;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin->translate('PLUGIN_ADMIN.EXCEEDED_FILESIZE_LIMIT')
                ];

                return false;
            default:
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin->translate('PLUGIN_ADMIN.UNKNOWN_ERRORS')
                ];

                return false;
        }

        $grav_limit = $config->get('system.media.upload_limit', 0);
        // You should also check filesize here.
        if ($grav_limit > 0 && $_FILES['file']['size'] > $grav_limit) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.EXCEEDED_GRAV_FILESIZE_LIMIT')
            ];

            return false;
        }


        // Check extension
        $fileParts = pathinfo($_FILES['file']['name']);

        $fileExt = '';
        if (isset($fileParts['extension'])) {
            $fileExt = strtolower($fileParts['extension']);
        }

        // If not a supported type, return
        if (!$fileExt || !$config->get("media.types.{$fileExt}")) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.UNSUPPORTED_FILE_TYPE') . ': ' . $fileExt
            ];

            return false;
        }

        // Upload it
        if (!move_uploaded_file($_FILES['file']['tmp_name'],
            sprintf('%s/%s', $page->path(), $_FILES['file']['name']))
        ) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.FAILED_TO_MOVE_UPLOADED_FILE')
            ];

            return false;
        }

        $this->admin->json_response = [
            'status'  => 'success',
            'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_UPLOADED_SUCCESSFULLY')
        ];

        return true;
    }

    /**
     * Handles deleting a media file from a page
     *
     * @return bool True if the action was performed.
     */
    protected function taskDelmedia()
    {
        if (!$this->authorizeTask('delete media', ['admin.pages', 'admin.super'])) {
            return false;
        }

        $page = $this->admin->page(true);

        if (!$page) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.NO_PAGE_FOUND')
            ];

            return false;
        }

        $filename = !empty($this->post['filename']) ? $this->post['filename'] : null;
        if ($filename) {
            $targetPath = $page->path() . '/' . $filename;

            if (file_exists($targetPath)) {
                if (unlink($targetPath)) {
                    $this->admin->json_response = [
                        'status'  => 'success',
                        'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_DELETED') . ': ' . $filename
                    ];
                } else {
                    $this->admin->json_response = [
                        'status'  => 'error',
                        'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_COULD_NOT_BE_DELETED') . ': ' . $filename
                    ];
                }
            } else {
                //Try with responsive images @1x, @2x, @3x
                $ext = pathinfo($targetPath, PATHINFO_EXTENSION);
                $fullPathFilename = $page->path() . '/' . basename($targetPath, ".$ext");
                $responsiveTargetPath = $fullPathFilename . '@1x.' . $ext;

                $deletedResponsiveImage = false;
                if (file_exists($responsiveTargetPath) && unlink($responsiveTargetPath)) {
                    $deletedResponsiveImage = true;
                }

                $responsiveTargetPath = $fullPathFilename . '@2x.' . $ext;
                if (file_exists($responsiveTargetPath) && unlink($responsiveTargetPath)) {
                    $deletedResponsiveImage = true;
                }

                $responsiveTargetPath = $fullPathFilename . '@3x.' . $ext;
                if (file_exists($responsiveTargetPath) && unlink($responsiveTargetPath)) {
                    $deletedResponsiveImage = true;
                }

                if ($deletedResponsiveImage) {
                    $this->admin->json_response = [
                        'status'  => 'success',
                        'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_DELETED') . ': ' . $filename
                    ];
                } else {
                    $this->admin->json_response = [
                        'status'  => 'error',
                        'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_NOT_FOUND') . ': ' . $filename
                    ];
                }

            }
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.NO_FILE_FOUND')
            ];
        }

        return true;
    }

    /**
     * Process the page Markdown
     *
     * @return bool True if the action was performed.
     */
    protected function taskProcessMarkdown()
    {
//        if (!$this->authorizeTask('process markdown', ['admin.pages', 'admin.super'])) {
//            return;
//        }

        try {
            $page = $this->admin->page(true);

            if (!$page) {
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin->translate('PLUGIN_ADMIN.NO_PAGE_FOUND')
                ];

                return false;
            }

            $this->preparePage($page, true);
            $page->header();

            // Add theme template paths to Twig loader
            $template_paths = $this->grav['locator']->findResources('theme://templates');
            $this->grav['twig']->twig->getLoader()->addLoader(new \Twig_Loader_Filesystem($template_paths));

            $html = $page->content();

            $this->admin->json_response = ['status' => 'success', 'preview' => $html];
        } catch (\Exception $e) {
            $this->admin->json_response = ['status' => 'error', 'message' => $e->getMessage()];

            return false;
        }

        return true;
    }

    /**
     * Enable a plugin.
     *
     * @return bool True if the action was performed.
     */
    public function taskEnable()
    {
        if (!$this->authorizeTask('enable plugin', ['admin.plugins', 'admin.super'])) {
            return false;
        }

        if ($this->view != 'plugins') {
            return false;
        }

        // Filter value and save it.
        $this->post = ['enabled' => true];
        $obj = $this->prepareData($this->post);
        $obj->save();

        $this->post = ['_redirect' => 'plugins'];
        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_ENABLED_PLUGIN'), 'info');

        return true;
    }

    /**
     * Disable a plugin.
     *
     * @return bool True if the action was performed.
     */
    public function taskDisable()
    {
        if (!$this->authorizeTask('disable plugin', ['admin.plugins', 'admin.super'])) {
            return false;
        }

        if ($this->view != 'plugins') {
            return false;
        }

        // Filter value and save it.
        $this->post = ['enabled' => false];
        $obj = $this->prepareData($this->post);
        $obj->save();

        $this->post = ['_redirect' => 'plugins'];
        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_DISABLED_PLUGIN'), 'info');

        return true;
    }

    /**
     * Set the default theme.
     *
     * @return bool True if the action was performed.
     */
    public function taskActivate()
    {
        if (!$this->authorizeTask('activate theme', ['admin.themes', 'admin.super'])) {
            return false;
        }

        if ($this->view != 'themes') {
            return false;
        }

        $this->post = ['_redirect' => 'themes'];

        // Make sure theme exists (throws exception)
        $name = $this->route;
        $this->grav['themes']->get($name);

        // Store system configuration.
        $system = $this->admin->data('config/system');
        $system->set('pages.theme', $name);
        $system->save();

        // Force configuration reload and save.
        /** @var Config $config */
        $config = $this->grav['config'];
        $config->reload()->save();

        $config->set('system.pages.theme', $name);

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_CHANGED_THEME'), 'info');

        return true;
    }

    /**
     * Handles updating Grav
     *
     * @return bool True if the action was performed
     */
    public function taskUpdategrav()
    {
        require_once __DIR__ . '/gpm.php';

        if (!$this->authorizeTask('install grav', ['admin.super'])) {
            return false;
        }

        $gpm = \Grav\Plugin\Admin\Gpm::GPM();
        $version = $gpm->grav->getVersion();

        $result = \Grav\Plugin\Admin\Gpm::selfupgrade();

        if ($result) {
            $this->admin->json_response = [
                'status'  => 'success',
                'type'    => 'updategrav',
                'version' => $version,
                'message' => $this->admin->translate('PLUGIN_ADMIN.GRAV_WAS_SUCCESSFULLY_UPDATED_TO') . ' ' . $version
            ];
        } else {
            $this->admin->json_response = [
                'status'  => 'error',
                'type'    => 'updategrav',
                'version' => GRAV_VERSION,
                'message' => $this->admin->translate('PLUGIN_ADMIN.GRAV_UPDATE_FAILED') . ' <br>' . Installer::lastErrorMsg()
            ];
        }

        return true;
    }

    /**
     * Handles uninstalling plugins and themes
     *
     * @deprecated
     *
     * @return bool True if the action was performed
     */
    public function taskUninstall()
    {
        $type = $this->view === 'plugins' ? 'plugins' : 'themes';
        if (!$this->authorizeTask('uninstall ' . $type, ['admin.' . $type, 'admin.super'])) {
            return false;
        }

        require_once __DIR__ . '/gpm.php';

        $package = $this->route;

        $result = \Grav\Plugin\Admin\Gpm::uninstall($package, []);

        if ($result) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.UNINSTALL_SUCCESSFUL'), 'info');
        } else {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.UNINSTALL_FAILED'), 'error');
        }

        $this->post = ['_redirect' => $this->view];

        return true;
    }

    /**
     * @param $field
     *
     * @return array
     */
    private function cleanFilesData($field)
    {
        /** @var Page $page */
        $page = null;
        $cleanFiles = [];

        $file = $_FILES['data'];

        $errors = (array)Utils::getDotNotation($file['error'], $field['name']);

        foreach ($errors as $index => $error) {
            if ($error == UPLOAD_ERR_OK) {

                $fieldname = $field['name'];

                // Deal with multiple files
                if (isset($field['multiple']) && $field['multiple'] == true) {
                    $fieldname = $fieldname . ".$index";
                }

                $tmp_name = Utils::getDotNotation($file['tmp_name'], $fieldname);
                $name = Utils::getDotNotation($file['name'], $fieldname);
                $type = Utils::getDotNotation($file['type'], $fieldname);
                $size = Utils::getDotNotation($file['size'], $fieldname);

                $original_destination = null;
                $destination = Folder::getRelativePath(rtrim($field['destination'], '/'));

                if (!$this->match_in_array($type, $field['accept'])) {
                    throw new \RuntimeException('File "' . $name . '" is not an accepted MIME type.');
                }

                if (isset($field['random_name']) && $field['random_name'] === true) {
                    $path_parts = pathinfo($name);
                    $name = Utils::generateRandomString(15) . '.' . $path_parts['extension'];
                }

                $resolved_destination = $this->admin->getPagePathFromToken($destination);
                $upload_path = $resolved_destination . '/' . $name;

                // Create dir if need be
                if (!is_dir($resolved_destination)) {
                    Folder::mkdir($resolved_destination);
                }

                if (move_uploaded_file($tmp_name, $upload_path)) {
                    $path = $destination . '/' . $name;
                    $fileData = [
                        'name'  => $name,
                        'path'  => $path,
                        'type'  => $type,
                        'size'  => $size,
                        'file'  => $destination . '/' . $name,
                        'route' => $page ? $path : null
                    ];

                    $cleanFiles[$field['name']][$path] = $fileData;
                } else {
                    throw new \RuntimeException("Unable to upload file(s) to $destination/$name");
                }


            } else {
                if ($error != UPLOAD_ERR_NO_FILE) {
                    throw new \RuntimeException("Unable to upload file(s) - Error: " . $field['name'] . ": " . $this->upload_errors[$error]);
                }
            }
        }

        return $cleanFiles;
    }

    /**
     * @param string       $needle
     * @param array|string $haystack
     *
     * @return bool
     */
    private function match_in_array($needle, $haystack)
    {
        foreach ((array)$haystack as $item) {
            if (true == preg_match("#^" . strtr(preg_quote($item, '#'), ['\*' => '.*', '\?' => '.']) . "$#i",
                    $needle)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param mixed $obj
     *
     * @return mixed
     */
    private function processFiles($obj)
    {
        if (!isset($_FILES['data'])) {
            return $obj;
        }

        $blueprints = $obj->blueprints();

        if (!isset($blueprints['form']['fields'])) {
            throw new \RuntimeException('Blueprints missing form fields definition');
        }
        $fields = $blueprints['form']['fields'];

        $found_files = $this->findFields('file', $fields);

        foreach ($found_files as $key => $data) {
            if ($this->view == 'pages') {
                $keys = explode('.', preg_replace('/^header./', '', $key));
                $init_key = array_shift($keys);
                if (count($keys) > 0) {
                    $new_data = isset($obj->header()->$init_key) ? $obj->header()->$init_key : [];
                    Utils::setDotNotation($new_data, implode('.', $keys), $data);
                } else {
                    $new_data = $data;
                }
                $obj->modifyHeader($init_key, $new_data);
            } else {
                $obj->set($key, $data);
            }
        }

        return $obj;
    }

    public function findFields($type, $fields, $found = [])
    {
        foreach ($fields as $key => $field) {

            if (isset($field['type']) && $field['type'] == $type) {
                $file_field = $this->cleanFilesData($field);
            } elseif (isset($field['fields'])) {
                $result = $this->findFields($type, $field['fields'], $found);
                if (!empty($result)) {
                    $found = array_merge($found, $result);
                }
            } else {
                $file_field = null;
            }

            if (isset($file_field) && (!is_array($file_field) || !empty($file_field))) {
                $found = array_merge($file_field, $found);
            }
        }

        return $found;
    }

    /**
     * Get the next available ordering number in a folder
     *
     * @return string the correct order string to prepend
     */
    private function getNextOrderInFolder($path)
    {
        $files = Folder::all($path, ['recursive' => false]);

        $highestOrder = 0;
        foreach ($files as $file) {
            preg_match(PAGE_ORDER_PREFIX_REGEX, $file, $order);

            if (isset($order[0])) {
                $theOrder = intval(trim($order[0], '.'));
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
     * Handles creating an empty page folder (without markdown file)
     *
     * @return bool True if the action was performed.
     */
    public function taskSaveNewFolder()
    {
        if (!$this->authorizeTask('save', $this->dataPermissions())) {
            return false;
        }

        $data = (array)$this->data;

        if ($data['route'] == '/') {
            $path = $this->grav['locator']->findResource('page://');
        } else {
            $path = $this->grav['page']->find($data['route'])->path();
        }

        $orderOfNewFolder = $this->getNextOrderInFolder($path);

        Folder::mkdir($path . '/' . $orderOfNewFolder . '.' . $data['folder']);
        Cache::clearCache('standard');

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_SAVED'), 'info');

        $multilang = $this->isMultilang();
        $admin_route = $this->grav['config']->get('plugins.admin.route');
        $redirect_url = '/' . ($multilang ? ($this->grav['session']->admin_lang) : '') . $admin_route . '/' . $this->view;
        $this->setRedirect($redirect_url);

        return true;
    }

    /**
     * @param string $frontmatter
     *
     * @return bool
     */
    public function checkValidFrontmatter($frontmatter)
    {
        try {
            // Try native PECL YAML PHP extension first if available.
            if (function_exists('yaml_parse')) {
                $saved = @ini_get('yaml.decode_php');
                @ini_set('yaml.decode_php', 0);
                @yaml_parse("---\n" . $frontmatter . "\n...");
                @ini_set('yaml.decode_php', $saved);
            } else {
                Yaml::parse($frontmatter);
            }
        } catch (ParseException $e) {
            return false;
        }

        return true;
    }

    /**
     * Handles form and saves the input data if its valid.
     *
     * @return bool True if the action was performed.
     */
    public function taskSave()
    {
        if (!$this->authorizeTask('save', $this->dataPermissions())) {
            return false;
        }

        $reorder = true;
        $data = (array)$this->data;

        $config = $this->grav['config'];

        // Special handler for pages data.
        if ($this->view == 'pages') {
            /** @var Pages $pages */
            $pages = $this->grav['pages'];

            // Find new parent page in order to build the path.
            $route = !isset($data['route']) ? dirname($this->admin->route) : $data['route'];

            /** @var Page $obj */
            $obj = $this->admin->page(true);

            // Ensure route is prefixed with a forward slash.
            $route = '/' . ltrim($route, '/');

            if (isset($data['frontmatter']) && !$this->checkValidFrontmatter($data['frontmatter'])) {
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INVALID_FRONTMATTER_COULD_NOT_SAVE'),
                    'error');

                return false;
            }

            //Handle system.home.hide_in_urls
            $hide_home_route = $config->get('system.home.hide_in_urls', false);
            if ($hide_home_route) {
                $home_route = $config->get('system.home.alias');
                $topParent = $obj->topParent();
                if (isset($topParent)) {
                    if ($topParent->route() == $home_route) {
                        $baseRoute = (string)$topParent->route();
                        if ($obj->parent() != $topParent) {
                            $baseRoute .= $obj->parent()->route();
                        }
                        $route = isset($baseRoute) ? $baseRoute : null;
                    }
                }
            }

            $parent = $route && $route != '/' && $route != '.' ? $pages->dispatch($route, true) : $pages->root();

            $original_slug = $obj->slug();
            $original_order = intval(trim($obj->order(), '.'));

            // Change parent if needed and initialize move (might be needed also on ordering/folder change).
            $obj = $obj->move($parent);
            $this->preparePage($obj, false, $obj->language());

            $obj = $this->processFiles($obj);

            // Reset slug and route. For now we do not support slug twig variable on save.
            $obj->slug($original_slug);

            try {
                $obj->validate();
            } catch (\Exception $e) {
                $this->admin->setMessage($e->getMessage(), 'error');

                return false;
            }
            $obj->filter();

            // rename folder based on visible
            if ($original_order == 1000) {
                // increment order to force reshuffle
                $obj->order($original_order + 1);
            }

            // add or remove numeric prefix based on ordering value
            if (isset($data['ordering'])) {
                if ($data['ordering'] && !$obj->order()) {
                    $obj->order($this->getNextOrderInFolder($obj->parent()->path()));
                    $reorder = false;
                } elseif (!$data['ordering'] && $obj->order()) {
                    $obj->folder($obj->slug());
                }
            }


        } else {
            // Handle standard data types.
            $obj = $this->prepareData($data);
            $obj = $this->processFiles($obj);
            try {
                $obj->validate();
            } catch (\Exception $e) {
                $this->admin->setMessage($e->getMessage(), 'error');

                return false;
            }

            $obj->filter();
        }

        if ($obj) {
            // Event to manipulate data before saving the object
            $this->grav->fireEvent('onAdminSave', new Event(['object' => &$obj]));
            $obj->save($reorder);
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_SAVED'), 'info');
        }

        if ($this->view != 'pages') {
            // Force configuration reload.
            /** @var Config $config */
            $config = $this->grav['config'];
            $config->reload();

            if ($this->view === 'user') {
                $this->grav['user']->merge(User::load($this->admin->route)->toArray());
            }
        }

        // Always redirect if a page route was changed, to refresh it
        if ($obj instanceof Page) {
            if (method_exists($obj, 'unsetRouteSlug')) {
                $obj->unsetRouteSlug();
            }

            $multilang = $this->isMultilang();

            if ($multilang) {
                if (!$obj->language()) {
                    $obj->language($this->grav['session']->admin_lang);
                }
            }
            $admin_route = $this->grav['config']->get('plugins.admin.route');

            //Handle system.home.hide_in_urls
            $route = $obj->route();
            $hide_home_route = $config->get('system.home.hide_in_urls', false);
            if ($hide_home_route) {
                $home_route = $config->get('system.home.alias');
                $topParent = $obj->topParent();
                if (isset($topParent)) {
                    if ($topParent->route() == $home_route) {
                        $route = (string)$topParent->route() . $route;
                    }
                }
            }

            $redirect_url = '/' . ($multilang ? ($obj->language()) : '') . $admin_route . '/' . $this->view . $route;

            $this->setRedirect($redirect_url);
        }

        return true;
    }

    /**
     * Continue to the new page.
     *
     * @return bool True if the action was performed.
     */
    public function taskContinue()
    {
        $data = (array)$this->data;

        if ($this->view == 'users') {
            $username = strip_tags(strtolower($data['username']));
            $this->setRedirect("{$this->view}/{$username}");

            return true;
        }

        if ($this->view == 'groups') {
            $this->setRedirect("{$this->view}/{$data['groupname']}");

            return true;
        }

        if ($this->view != 'pages') {
            return false;
        }

        $route = $data['route'] != '/' ? $data['route'] : '';
        $folder = ltrim($data['folder'], '_');
        if (!empty($data['modular'])) {
            $folder = '_' . $folder;
        }
        $path = $route . '/' . $folder;

        $this->admin->session()->{$path} = $data;

        // Store the name and route of a page, to be used prefilled defaults of the form in the future
        $this->admin->session()->lastPageName = $data['name'];
        $this->admin->session()->lastPageRoute = $data['route'];

        $this->setRedirect("{$this->view}/" . ltrim($path, '/'));

        return true;
    }

    /**
     * Find the first available $item ('slug' | 'folder') for a page
     * Used when copying a page, to determine the first available slot
     *
     * @param string $item
     * @param Page   $page
     *
     * @return string The first available slot
     */
    protected function findFirstAvailable($item, $page)
    {
        if (!$page->parent()->children()) {
            return $page->$item();
        }

        $withoutPrefix = function ($string) {
            $match = preg_split('/^[0-9]+\./u', $string, 2, PREG_SPLIT_DELIM_CAPTURE);

            return isset($match[1]) ? $match[1] : $match[0];
        };

        $withoutPostfix = function ($string) {
            $match = preg_split('/-(\d+)$/', $string, 2, PREG_SPLIT_DELIM_CAPTURE);

            return $match[0];
        };
        $appendedNumber = function ($string) {
            $match = preg_split('/-(\d+)$/', $string, 2, PREG_SPLIT_DELIM_CAPTURE);
            $append = (isset($match[1]) ? (int)$match[1] + 1 : 2);

            return $append;
        };

        $highest = 1;
        $siblings = $page->parent()->children();
        $findCorrectAppendedNumber = function ($item, $page_item, $highest) use (
            $siblings,
            &$findCorrectAppendedNumber,
            &$withoutPrefix
        ) {
            foreach ($siblings as $sibling) {
                if ($withoutPrefix($sibling->$item()) == ($highest === 1 ? $page_item : $page_item . '-' . $highest)) {
                    $highest = $findCorrectAppendedNumber($item, $page_item, $highest + 1);

                    return $highest;
                }
            }

            return $highest;
        };

        $base = $withoutPrefix($withoutPostfix($page->$item()));

        $return = $base;
        $highest = $findCorrectAppendedNumber($item, $base, $highest);

        if ($highest > 1) {
            $return .= '-' . $highest;
        }

        return $return;
    }

    /**
     * Save page as a new copy.
     *
     * @return bool True if the action was performed.
     * @throws \RuntimeException
     */
    protected function taskCopy()
    {
        if (!$this->authorizeTask('copy page', ['admin.pages', 'admin.super'])) {
            return false;
        }

        // Only applies to pages.
        if ($this->view != 'pages') {
            return false;
        }

        try {
            /** @var Pages $pages */
            $pages = $this->grav['pages'];

            // Get the current page.
            $original_page = $this->admin->page(true);

            // Find new parent page in order to build the path.
            $parent = $original_page->parent() ?: $pages->root();
            // Make a copy of the current page and fill the updated information into it.
            $page = $original_page->copy($parent);

            if ($page->order()) {
                $order = $this->getNextOrderInFolder($page->parent()->path());
            }

            $this->preparePage($page);

            // Make sure the header is loaded in case content was set through raw() (expert mode)
            $page->header();

            if ($page->order()) {
                $page->order($order);
            }

            $folder = $this->findFirstAvailable('folder', $page);
            $slug = $this->findFirstAvailable('slug', $page);

            $page->path($page->parent()->path() . DS . $page->order() . $folder);
            $page->route($page->parent()->route() . '/' . $slug);
            $page->rawRoute($page->parent()->rawRoute() . '/' . $slug);

            // Append progressivenumber to the copied page title
            $match = preg_split('/(\d+)(?!.*\d)/', $original_page->title(), 2, PREG_SPLIT_DELIM_CAPTURE);
            $header = $page->header();
            if (!isset($match[1])) {
                $header->title = $match[0] . ' 2';
            } else {
                $header->title = $match[0] . ((int)$match[1] + 1);
            }

            $page->header($header);
            $page->save(false);

            $redirect = $this->view . $page->rawRoute();
            $header = $page->header();

            if (isset($header->slug)) {
                $match = preg_split('/-(\d+)$/', $header->slug, 2, PREG_SPLIT_DELIM_CAPTURE);
                $header->slug = $match[0] . '-' . (isset($match[1]) ? (int)$match[1] + 1 : 2);
            }

            $page->header($header);

            $page->save();
            // Enqueue message and redirect to new location.
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_COPIED'), 'info');
            $this->setRedirect($redirect);

        } catch (\Exception $e) {
            throw new \RuntimeException('Copying page failed on error: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Reorder pages.
     *
     * @return bool True if the action was performed.
     */
    protected function taskReorder()
    {
        if (!$this->authorizeTask('reorder pages', ['admin.pages', 'admin.super'])) {
            return false;
        }

        // Only applies to pages.
        if ($this->view != 'pages') {
            return false;
        }

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.REORDERING_WAS_SUCCESSFUL'), 'info');

        return true;
    }

    /**
     * Delete page.
     *
     * @return bool True if the action was performed.
     * @throws \RuntimeException
     */
    protected function taskDelete()
    {
        if (!$this->authorizeTask('delete page', ['admin.pages', 'admin.super'])) {
            return false;
        }

        // Only applies to pages.
        if ($this->view != 'pages') {
            return false;
        }

        try {
            $page = $this->admin->page();

            if (count($page->translatedLanguages()) > 1) {
                $page->file()->delete();
            } else {
                Folder::delete($page->path());
            }

            Cache::clearCache('standard');

            // Set redirect to either referrer or pages list.
            $redirect = 'pages';

            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_DELETED'), 'info');
            $this->setRedirect($redirect);

        } catch (\Exception $e) {
            throw new \RuntimeException('Deleting page failed on error: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Switch the content language. Optionally redirect to a different page.
     *
     * @return bool True if the action was performed.
     */
    protected function taskSwitchlanguage()
    {
        $data = (array)$this->data;

        if (isset($data['lang'])) {
            $language = $data['lang'];
        } else {
            $language = $this->grav['uri']->param('lang');
        }

        if (isset($data['redirect'])) {
            $redirect = 'pages/' . $data['redirect'];
        } else {
            $redirect = 'pages';
        }


        if ($language) {
            $this->grav['session']->admin_lang = $language ?: 'en';
        }

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_SWITCHED_LANGUAGE'), 'info');

        $admin_route = $this->grav['config']->get('plugins.admin.route');
        $this->setRedirect('/' . $language . $admin_route . '/' . $redirect);

    }

    /**
     * Save the current page in a different language. Automatically switches to that language.
     *
     * @return bool True if the action was performed.
     */
    protected function taskSaveas()
    {
        if (!$this->authorizeTask('save', $this->dataPermissions())) {
            return false;
        }

        $data = (array)$this->data;
        $language = $data['lang'];

        if ($language) {
            $this->grav['session']->admin_lang = $language ?: 'en';
        }

        $uri = $this->grav['uri'];
        $obj = $this->admin->page($uri->route());
        $this->preparePage($obj, false, $language);

        $file = $obj->file();
        if ($file) {
            $filename = substr($obj->name(), 0, -(strlen('.' . $language . '.md')));

            if (substr($filename, -3, 1) == '.') {
                if (substr($filename, -2) == substr($language, 0, 2)) {
                    $filename = str_replace(substr($filename, -2), $language, $filename);
                }
            } elseif (substr($filename, -6, 1) == '.') {
                if (substr($filename, -5) == substr($language, 0, 5)) {
                    $filename = str_replace(substr($filename, -5), $language, $filename);
                }
            } else {
                $filename .= '.' . $language;
            }

            $path = $obj->path() . DS . $filename . '.md';
            $aFile = File::instance($path);
            $aFile->save();

            $aPage = new Page();
            $aPage->init(new \SplFileInfo($path), $language . '.md');
            $aPage->header($obj->header());
            $aPage->rawMarkdown($obj->rawMarkdown());
            $aPage->validate();
            $aPage->filter();
            $aPage->save();
        }

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_SWITCHED_LANGUAGE'), 'info');
        $this->setRedirect('/' . $language . $uri->route());

        return true;
    }

    /**
     * Determine if the user can edit media
     *
     * @param string $type
     *
     * @return bool True if the media action is allowed
     */
    protected function canEditMedia($type = 'media')
    {
        if (!$this->authorizeTask('edit media', ['admin.' . $type, 'admin.super'])) {
            return false;
        }

        return true;
    }

    /**
     * Handles removing a media file
     *
     * @return bool True if the action was performed
     */
    public function taskRemoveMedia()
    {
        if (!$this->canEditMedia()) {
            return false;
        }

        $filename = base64_decode($this->route);

        $file = File::instance($filename);
        $resultRemoveMedia = false;
        $resultRemoveMediaMeta = true;

        if ($file->exists()) {
            $resultRemoveMedia = $file->delete();

            $metaFilePath = $filename . '.meta.yaml';
            $metaFilePath = str_replace('@3x', '', $metaFilePath);
            $metaFilePath = str_replace('@2x', '', $metaFilePath);

            if (is_file($metaFilePath)) {
                $metaFile = File::instance($metaFilePath);
                $resultRemoveMediaMeta = $metaFile->delete();
            }
        }

        if ($resultRemoveMedia && $resultRemoveMediaMeta) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.REMOVE_SUCCESSFUL'), 'info');
        } else {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.REMOVE_FAILED'), 'error');
        }

        $this->post = ['_redirect' => 'media'];

        return true;
    }

    /**
     * Handle deleting a file from a blueprint
     *
     * @return bool True if the action was performed.
     */
    protected function taskRemoveFileFromBlueprint()
    {
        $uri = $this->grav['uri'];
        $blueprint = base64_decode($uri->param('blueprint'));
        $path = base64_decode($uri->param('path'));
        $proute = base64_decode($uri->param('proute'));
        $type = $uri->param('type');
        $field = $uri->param('field');

        $this->taskRemoveMedia();

        if ($type == 'pages') {
            $page = $this->admin->page(true, $proute);
            $keys = explode('.', preg_replace('/^header./', '', $field));
            $header = (array)$page->header();
            $data_path = implode('.', $keys);
            $data = Utils::getDotNotation($header, $data_path);

            if (isset($data[$path])) {
                unset($data[$path]);
                Utils::setDotNotation($header, $data_path, $data);
                $page->header($header);
            }

            $page->save();
        } else {
            $blueprint_prefix = $type == 'config' ? '' : $type . '.';
            $blueprint_name = str_replace('/blueprints', '', str_replace('config/', '', $blueprint));
            $blueprint_field = $blueprint_prefix . $blueprint_name . '.' . $field;
            $files = $this->grav['config']->get($blueprint_field);

            foreach ($files as $key => $value) {
                if ($key == $path) {
                    unset($files[$key]);
                }
            }

            $this->grav['config']->set($blueprint_field, $files);

            switch ($type) {
                case 'config':
                    $data = $this->grav['config']->get($blueprint_name);
                    $config = $this->admin->data($blueprint, $data);
                    $config->save();
                    break;
                case 'themes':
                    Theme::saveConfig($blueprint_name);
                    break;
                case 'plugins':
                    Plugin::saveConfig($blueprint_name);
                    break;
            }
        }
//
//
        $redirect = base64_decode($uri->param('redirect'));
        $route = $this->grav['config']->get('plugins.admin.route');

        if (substr($redirect, 0, strlen($route)) == $route) {
            $redirect = substr($redirect, strlen($route) + 1);
        }

        $this->post = ['_redirect' => $redirect];

        return true;
    }

    /**
     * Prepare and return POST data.
     *
     * @param array $post
     *
     * @return array
     */
    protected function getPost($post)
    {
        unset($post['task']);

        // Decode JSON encoded fields and merge them to data.
        if (isset($post['_json'])) {
            $post = array_merge_recursive($post, $this->jsonDecode($post['_json']));
            unset($post['_json']);
        }

        return $post;
    }

    /**
     * Recursively JSON decode data.
     *
     * @param  array $data
     *
     * @return array
     */
    protected function jsonDecode(array $data)
    {
        foreach ($data as &$value) {
            if (is_array($value)) {
                $value = $this->jsonDecode($value);
            } else {
                $value = json_decode($value, true);
            }
        }

        return $data;
    }

    /**
     * Sets the page redirect.
     *
     * @param string $path The path to redirect to
     * @param int    $code The HTTP redirect code
     */
    protected function setRedirect($path, $code = 303)
    {
        $this->redirect = $path;
        $this->redirectCode = $code;
    }

    /**
     * Gets the configuration data for a given view & post
     *
     * @return object
     */
    protected function prepareData(array $data)
    {
        $type = trim("{$this->view}/{$this->admin->route}", '/');
        $data = $this->admin->data($type, $data);

        return $data;
    }

    /**
     * Gets the permissions needed to access a given view
     *
     * @return array An array of permissions
     */
    protected function dataPermissions()
    {
        $type = $this->view;
        $permissions = ['admin.super'];

        switch ($type) {
            case 'configuration':
            case 'system':
                $permissions[] = 'admin.configuration';
                break;
            case 'settings':
            case 'site':
                $permissions[] = 'admin.settings';
                break;
            case 'plugins':
                $permissions[] = 'admin.plugins';
                break;
            case 'themes':
                $permissions[] = 'admin.themes';
                break;
            case 'users':
                $permissions[] = 'admin.users';
                break;
            case 'pages':
                $permissions[] = 'admin.pages';
                break;
        }

        return $permissions;
    }

    /**
     * Prepare a page to be stored: update its folder, name, template, header and content
     *
     * @param \Grav\Common\Page\Page $page
     * @param bool                   $clean_header
     * @param string                 $language
     */
    protected function preparePage(Page $page, $clean_header = false, $language = '')
    {
        $input = (array)$this->data;

        if (isset($input['order'])) {
            $order = max(0, ((int)isset($input['order']) && $input['order']) ? $input['order'] : $page->value('order'));
            $ordering = $order ? sprintf('%02d.', $order) : '';
            $slug = empty($input['folder']) ? $page->value('folder') : (string)$input['folder'];
            $page->folder($ordering . $slug);
        }

        if (isset($input['name']) && !empty($input['name'])) {
            $type = (string)strtolower($input['name']);
            $name = preg_replace('|.*/|', '', $type);
            if ($language) {
                $name .= '.' . $language;
            } else {
                $language = $this->grav['language'];
                if ($language->enabled()) {
                    $name .= '.' . $language->getLanguage();
                }
            }
            $name .= '.md';
            $page->name($name);
            $page->template($type);
        }

        // Special case for Expert mode: build the raw, unset content
        if (isset($input['frontmatter']) && isset($input['content'])) {
            $page->raw("---\n" . (string)$input['frontmatter'] . "\n---\n" . (string)$input['content']);
            unset($input['content']);
        }

        if (isset($input['header'])) {
            $header = $input['header'];

            foreach ($header as $key => $value) {
                if ($key == 'metadata' && is_array($header[$key])) {
                    foreach ($header['metadata'] as $key2 => $value2) {
                        if (isset($input['toggleable_header']['metadata'][$key2]) && !$input['toggleable_header']['metadata'][$key2]) {
                            $header['metadata'][$key2] = '';
                        }
                    }
                } elseif ($key == 'taxonomy' && is_array($header[$key])) {
                    foreach ($header[$key] as $taxkey => $taxonomy) {
                        if (is_array($taxonomy) && count($taxonomy) == 1 && trim($taxonomy[0]) == '') {
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
                    return !(is_null($v) || $v === '');
                });
            }
            $page->header((object)$header);
            $page->frontmatter(Yaml::dump((array)$page->header()));
        }
        // Fill content last because it also renders the output.
        if (isset($input['content'])) {
            $page->rawMarkdown((string)$input['content']);
        }
    }

    /**
     * Checks if the user is allowed to perform the given task with its associated permissions
     *
     * @param string $task        The task to execute
     * @param array  $permissions The permissions given
     *
     * @return bool True if authorized. False if not.
     */
    protected function authorizeTask($task = '', $permissions = [])
    {
        if (!$this->admin->authorize($permissions)) {
            if ($this->grav['uri']->extension() === 'json') {
                $this->admin->json_response = [
                    'status'  => 'unauthorized',
                    'message' => $this->admin->translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' ' . $task . '.'
                ];
            } else {
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' ' . $task . '.',
                    'error');
            }

            return false;
        }

        return true;
    }
}
