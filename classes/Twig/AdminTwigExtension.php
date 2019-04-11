<?php

namespace Grav\Plugin\Admin\Twig;

use Grav\Common\Grav;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Common\Yaml;
use Grav\Common\Language\Language;

class AdminTwigExtension extends \Twig_Extension
{
    /**
     * @var Grav
     */
    protected $grav;

    /**
     * @var Language $lang
     */
    protected $lang;

    public function __construct()
    {
        $this->grav = Grav::instance();
        $this->lang = $this->grav['user']->language;
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('tu', [$this, 'tuFilter']),
            new \Twig_SimpleFilter('toYaml', [$this, 'toYamlFilter']),
            new \Twig_SimpleFilter('fromYaml', [$this, 'fromYamlFilter']),
            new \Twig_SimpleFilter('adminNicetime', [$this, 'adminNicetimeFilter']),
            new \Twig_SimpleFilter('nested', [$this, 'nestedFilter']),
        ];
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('getPageUrl', [$this, 'getPageUrl'], ['needs_context' => true]),
            new \Twig_SimpleFunction('clone', [$this, 'cloneFunc']),
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

    public function cloneFunc($obj)
    {
        return clone $obj;
    }

    public function getPageUrl($context, PageInterface $page)
    {
        $page_route = trim($page->rawRoute(), '/');
        $page_lang = $page->language();
        $base_url = $context['base_url'];
        $base_url_simple = $context['base_url_simple'];
        $admin_lang = Grav::instance()['session']->admin_lang ?: 'en';

        if ($page_lang && $page_lang !== $admin_lang) {
            $page_url = $base_url_simple . '/' . $page_lang . '/' . $context['admin_route'] . '/pages/' . $page_route;
        } else {
            $page_url = $base_url . '/pages/' . $page_route;
        }

        return $page_url;
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

}
