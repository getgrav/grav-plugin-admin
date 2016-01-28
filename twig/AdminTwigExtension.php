<?php
namespace Grav\Plugin;

use Grav\Common\Grav;
use Grav\Common\Language\Language;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Parser;

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

    /**
     * Returns extension name.
     *
     * @return string
     */
    public function getName()
    {
        return 'AdminTwigExtension';
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('tu', [$this, 'tuFilter']),
            new \Twig_SimpleFilter('toYaml', [$this, 'toYamlFilter']),
            new \Twig_SimpleFilter('fromYaml', [$this, 'fromYamlFilter']),

        ];
    }

    public function tuFilter()
    {
        return $this->grav['admin']->translate(func_get_args());
    }

    public function toYamlFilter($value, $inline = true)
    {
        return Yaml::dump($value, $inline);

    }

    public function fromYamlFilter($value)
    {
        $yaml = new Parser();
        return $yaml->parse($value);
    }
}
