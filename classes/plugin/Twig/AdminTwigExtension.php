<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2023 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin\Twig;

use Grav\Common\Data\Data;
use Grav\Common\Grav;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Common\Utils;
use Grav\Common\Yaml;
use Grav\Common\Language\Language;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;
use Grav\Plugin\Admin\Admin;

class AdminTwigExtension extends AbstractExtension
{
    /** @var Grav */
    protected $grav;

    /** @var Language $lang */
    protected $lang;

    public function __construct()
    {
        $this->grav = Grav::instance();
        $this->lang = $this->grav['user']->language;
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('tu', [$this, 'tuFilter']),
            new TwigFilter('toYaml', [$this, 'toYamlFilter']),
            new TwigFilter('fromYaml', [$this, 'fromYamlFilter']),
            new TwigFilter('adminNicetime', [$this, 'adminNicetimeFilter']),
            new TwigFilter('nested', [$this, 'nestedFilter']),
            new TwigFilter('flatten', [$this, 'flattenFilter']),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('admin_route', [$this, 'adminRouteFunc']),
            new TwigFunction('getPageUrl', [$this, 'getPageUrl']),
            new TwigFunction('clone', [$this, 'cloneFunc']),
            new TwigFunction('data', [$this, 'dataFunc']),
        ];
    }

    public function nestedFilter($current, $name)
    {
        $path = explode('.', trim($name, '.'));

        foreach ($path as $field) {
            if (is_object($current) && isset($current->{$field})) {
                $current = $current->{$field};
            } elseif (is_array($current) && isset($current[$field])) {
                $current = $current[$field];
            } else {
                return null;
            }
        }

        return $current;
    }

    public function flattenFilter($array)
    {
        return Utils::arrayFlattenDotNotation($array);
    }

    public function cloneFunc($obj)
    {
        return clone $obj;
    }

    public function adminRouteFunc(string $route = '', string $languageCode = null)
    {
        /** @var Admin $admin */
        $admin = Grav::instance()['admin'];

        return $admin->getAdminRoute($route, $languageCode)->toString(true);
    }

    public function getPageUrl(PageInterface $page)
    {
        /** @var Admin $admin */
        $admin = Grav::instance()['admin'];

        return $admin->getAdminRoute('/pages' . $page->rawRoute(), $page->language())->toString(true);
    }

    public static function tuFilter()
    {
        $args = func_get_args();
        $numargs = count($args);
        $lang = null;

        if (($numargs === 3 && is_array($args[1])) || ($numargs === 2 && !is_array($args[1]))) {
            $lang = array_pop($args);
        } elseif ($numargs === 2 && is_array($args[1])) {
            $subs = array_pop($args);
            $args = array_merge($args, $subs);
        }

        return Grav::instance()['admin']->translate($args, $lang);
    }

    public function toYamlFilter($value, $inline = null)
    {
        return Yaml::dump($value, $inline);

    }

    public function fromYamlFilter($value)
    {
        return Yaml::parse($value);
    }

    public function adminNicetimeFilter($date, $long_strings = true)
    {
        return Grav::instance()['admin']->adminNiceTime($date, $long_strings);
    }

    public function dataFunc(array $data, $blueprints = null)
    {
        return new Data($data, $blueprints);
    }
}
