<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2023 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin;

use Grav\Common\Grav;
use Grav\Common\User\Interfaces\UserCollectionInterface;
use Grav\Common\User\Interfaces\UserInterface;

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
     * @param string $email
     *
     * @return UserInterface
     */
    public static function findUserByEmail(string $email)
    {
        $grav = Grav::instance();

        /** @var UserCollectionInterface $users */
        $users = $grav['accounts'];

        return $users->find($email, ['email']);
    }

    /**
     * Generates a slug of the given string
     *
     * @param string $str
     * @return string
     */
    public static function slug(string $str)
    {
        if (function_exists('transliterator_transliterate')) {
            $str = transliterator_transliterate('Any-Latin; NFD; [:Nonspacing Mark:] Remove; NFC; [:Punctuation:] Remove;', $str);
        } else {
            $str = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);
        }

        $str = strtolower($str);
        $str = preg_replace('/[-\s]+/', '-', $str);
        $str = preg_replace('/[^a-z0-9-]/i', '', $str);
        $str = trim($str, '-');

        return $str;
    }
}
