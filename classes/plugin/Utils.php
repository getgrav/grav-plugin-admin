<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2024 Trilby Media, LLC. All rights reserved.
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

    /**
     * Whether a page folder name is a single folder inside its parent: not empty, not `.` or `..`,
     * and free of path separators.
     *
     * @param mixed $folder
     * @return bool
     */
    public static function isValidPageFolder($folder): bool
    {
        if (!is_string($folder) || $folder === '' || $folder === '.' || $folder === '..') {
            return false;
        }

        return strpbrk($folder, "/\\\0") === false;
    }

    /**
     * Whether a page route has a `.` or `..` segment, a backslash or a null byte. Routes name pages,
     * so any of these means the value is a filesystem path, not a route.
     *
     * @param string $route
     * @return bool
     */
    public static function routeHasDotSegment(string $route): bool
    {
        return strpbrk($route, "\\\0") !== false || preg_match('#(^|/)\.{1,2}(/|$)#', $route) === 1;
    }

    /**
     * Whether a path is the given folder or sits inside it, compared after resolving both.
     *
     * @param string $path
     * @param string $folder
     * @return bool
     */
    public static function isPathInside(string $path, string $folder): bool
    {
        $path = realpath($path);
        $folder = realpath($folder);
        if (false === $path || false === $folder) {
            return false;
        }

        return $path === $folder || strpos($path, rtrim($folder, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR) === 0;
    }

    /**
     * Whether any extension of a file name is `svg`. Apache types a file by every extension it
     * knows, so `logo.svg.foo` is served as an SVG even though its last extension isn't.
     *
     * @param string $filename
     * @return bool
     */
    public static function hasSvgExtension(string $filename): bool
    {
        $parts = explode('.', mb_strtolower(basename($filename)));
        array_shift($parts);

        return in_array('svg', $parts, true);
    }
}
