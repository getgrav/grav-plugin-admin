<?php
namespace Grav\Plugin\Admin;

use Grav\Common\Grav;
use Grav\Common\User\User;

/**
 * Admin utils class
 *
 * @license MIT
 */
class Utils
{
    /**
     * Matches an email to a user
     *
     * @param $email
     *
     * @return User
     */
    public static function findUserByEmail($email)
    {
        $account_dir = Grav::instance()['locator']->findResource('account://');
        $files       = array_diff(scandir($account_dir), ['.', '..']);

        foreach ($files as $file) {
            if (strpos($file, '.yaml') !== false) {
                $user = User::load(trim(substr($file, 0, -5)));
                if ($user['email'] == $email) {
                    return $user;
                }
            }
        }

        // If a User with the provided email cannot be found, then load user with that email as the username
        return User::load($email);
    }
}
