<?php
namespace Grav\Plugin\Admin;

use Grav\Common\Grav;
use Grav\Common\GPM\GPM as GravGPM;
use Grav\Common\GPM\Installer;
use Grav\Common\GPM\Response;
use Grav\Common\GPM\Upgrader;
use Grav\Common\Filesystem\Folder;
use Grav\Common\GPM\Common\Package;

/**
 * Class Gpm
 * @package Grav\Plugin\Admin
 */
class Gpm
{
    // Probably should move this to Grav DI container?
    /** @var GravGPM */
    protected static $GPM;

    public static function GPM()
    {
        if (!static::$GPM) {
            static::$GPM = new GravGPM();
        }

        return static::$GPM;
    }

    /**
     * Default options for the install
     * @var array
     */
    protected static $options = [
        'destination'     => GRAV_ROOT,
        'overwrite'       => true,
        'ignore_symlinks' => true,
        'skip_invalid'    => true,
        'install_deps'    => true,
        'theme'           => false
    ];

    /**
     * @param Package[]|string[]|string $packages
     * @param array                     $options
     *
     * @return bool
     */
    public static function install($packages, array $options)
    {
        $options = array_merge(self::$options, $options);

        if (
            !Installer::isGravInstance($options['destination']) ||
            !Installer::isValidDestination($options['destination'], [Installer::EXISTS, Installer::IS_LINK])
        ) {
            return false;
        }

        $packages = is_array($packages) ? $packages : [$packages];
        $count = count($packages);

        $packages = array_filter(array_map(function ($p) {
            return !is_string($p) ? $p instanceof Package ? $p : false : self::GPM()->findPackage($p);
        }, $packages));

        if (!$options['skip_invalid'] && $count !== count($packages)) {
            return false;
        }

        $messages = '';

        foreach ($packages as $package) {
            if (isset($package->dependencies) && $options['install_deps']) {
                $result = static::install($package->dependencies, $options);

                if (!$result) {
                    return false;
                }
            }

            // Check destination
            Installer::isValidDestination($options['destination'] . DS . $package->install_path);

            if (Installer::lastErrorCode() === Installer::EXISTS && !$options['overwrite']) {
                return false;
            }

            if (Installer::lastErrorCode() === Installer::IS_LINK && !$options['ignore_symlinks']) {
                return false;
            }

            $local = static::download($package);

            Installer::install($local, $options['destination'],
                ['install_path' => $package->install_path, 'theme' => $options['theme']]);
            Folder::delete(dirname($local));

            $errorCode = Installer::lastErrorCode();
            if ($errorCode) {
                $msg = Installer::lastErrorMsg();
                throw new \RuntimeException($msg);
            }

            if (count($packages) == 1) {
                $message = Installer::getMessage();
                if ($message) {
                    return $message;
                } else {
                    $messages .= $message;
                }
            }
        }

        return $messages ?: true;
    }

    /**
     * @param Package[]|string[]|string $packages
     * @param array                     $options
     *
     * @return bool
     */
    public static function update($packages, array $options)
    {
        $options['overwrite'] = true;

        return static::install($packages, $options);
    }

    /**
     * @param Package[]|string[]|string $packages
     * @param array                     $options
     *
     * @return bool
     */
    public static function uninstall($packages, array $options)
    {
        $options = array_merge(self::$options, $options);

        $packages = is_array($packages) ? $packages : [$packages];
        $count = count($packages);

        $packages = array_filter(array_map(function ($p) {

            if (is_string($p)) {
                $p = strtolower($p);
                $plugin = static::GPM()->getInstalledPlugin($p);
                $p = $plugin ?: static::GPM()->getInstalledTheme($p);
            }

            return $p instanceof Package ? $p : false;

        }, $packages));

        if (!$options['skip_invalid'] && $count !== count($packages)) {
            return false;
        }

        foreach ($packages as $package) {

            $location = Grav::instance()['locator']->findResource($package->package_type . '://' . $package->slug);

            // Check destination
            Installer::isValidDestination($location);

            if (Installer::lastErrorCode() === Installer::IS_LINK && !$options['ignore_symlinks']) {
                return false;
            }

            Installer::uninstall($location);

            $errorCode = Installer::lastErrorCode();
            if ($errorCode && $errorCode !== Installer::IS_LINK && $errorCode !== Installer::EXISTS) {
                $msg = Installer::lastErrorMsg();
                throw new \RuntimeException($msg);
            }

            if (count($packages) == 1) {
                $message = Installer::getMessage();
                if ($message) {
                    return $message;
                }
            }
        }

        return true;
    }

    /**
     * @param Package $package
     *
     * @return string
     */
    private static function download(Package $package)
    {
        $contents = Response::get($package->zipball_url, []);

        $tmp_dir = Grav::instance()['locator']->findResource('tmp://', true, true);
        $tmp_dir = $tmp_dir . '/Grav-' . uniqid();
        Folder::mkdir($tmp_dir);

        $filename = $package->slug . basename($package->zipball_url);

        file_put_contents($tmp_dir . DS . $filename . '.zip', $contents);

        return $tmp_dir . DS . $filename . '.zip';
    }

    /**
     * @param array  $package
     * @param string $tmp
     *
     * @return string
     */
    private static function _downloadSelfupgrade(array $package, $tmp)
    {
        $output = Response::get($package['download'], []);
        Folder::mkdir($tmp);
        file_put_contents($tmp . DS . $package['name'], $output);

        return $tmp . DS . $package['name'];
    }

    /**
     * @return bool
     */
    public static function selfupgrade()
    {
        $upgrader = new Upgrader();

        if (!Installer::isGravInstance(GRAV_ROOT)) {
            return false;
        }

        if (is_link(GRAV_ROOT . DS . 'index.php')) {
            Installer::setError(Installer::IS_LINK);

            return false;
        }

        if (method_exists($upgrader, 'meetsRequirements') && !$upgrader->meetsRequirements()) {
            $error = [];
            $error[] = '<p>Grav has increased the minimum PHP requirement.<br />';
            $error[] = 'You are currently running PHP <strong>' . PHP_VERSION . '</strong>';
            $error[] = ', but PHP <strong>' . GRAV_PHP_MIN . '</strong> is required.</p>';
            $error[] = '<p><a href="http://getgrav.org/blog/changing-php-requirements-to-5.5" class="button button-small secondary">Additional information</a></p>';

            Installer::setError(implode("\n", $error));

            return false;
        }

        $update = $upgrader->getAssets()['grav-update'];
        $tmp_dir = Grav::instance()['locator']->findResource('tmp://', true, true);
        $tmp = $tmp_dir . '/Grav-' . uniqid();
        $file = self::_downloadSelfupgrade($update, $tmp);

        Installer::install($file, GRAV_ROOT,
            ['sophisticated' => true, 'overwrite' => true, 'ignore_symlinks' => true]);

        $errorCode = Installer::lastErrorCode();

        Folder::delete($tmp);

        if ($errorCode & (Installer::ZIP_OPEN_ERROR | Installer::ZIP_EXTRACT_ERROR)) {
            return false;
        }

        return true;
    }
}
