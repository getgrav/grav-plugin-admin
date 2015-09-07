<?php
namespace Grav\Plugin;

use \Grav\Common\Grav;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Dumper;

class AdminTwigExtension extends \Twig_Extension
{
    protected $grav;

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
        return $this->grav['admin']->translate(func_get_args(), [$this->grav['user']->authenticated ? $this->lang : 'en']);
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
