<?php

namespace Grav\Plugin\Admin;

class ScssList
{
    /** @var string[] */
    protected $list = [];

    /**
     * ScssList constructor.
     * @param string|null $item
     */
    public function __construct($item = null)
    {
        if ($item) {
            $this->add($item);
        }
    }

    /**
     * @return array
     */
    public function all(): array
    {
        return $this->list;
    }

    /**
     * @param string $item
     * @return void
     */
    public function add($item): void
    {
        if ($item) {
            $this->list[] = $item;
        }
    }

    /**
     * @param string $item
     * @return void
     */
    public function remove($item): void
    {
        $pos = array_search($item, $this->list, true);
        if ($pos) {
            unset($this->list[$pos]);
        }
    }

}
