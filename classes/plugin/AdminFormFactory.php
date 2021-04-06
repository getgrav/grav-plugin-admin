<?php

declare(strict_types=1);

namespace Grav\Plugin\Admin;

use Grav\Common\Grav;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Common\Page\Page;
use Grav\Framework\Form\Interfaces\FormFactoryInterface;
use Grav\Framework\Form\Interfaces\FormInterface;

/**
 * Class FlexFormFactory
 * @package Grav\Plugin\FlexObjects
 */
class AdminFormFactory implements FormFactoryInterface
{
    /**
     * @param Page $page
     * @param string $name
     * @param array $form
     * @return FormInterface|null
     */
    public function createPageForm(Page $page, string $name, array $form): ?FormInterface
    {
        return $this->createFormForPage($page, $name, $form);
    }

    /**
     * @param PageInterface $page
     * @param string $name
     * @param array $form
     * @return FormInterface|null
     */
    public function createFormForPage(PageInterface $page, string $name, array $form): ?FormInterface
    {
        /** @var Admin|null $admin */
        $admin = Grav::instance()['admin'] ?? null;
        $object = $admin->form ?? null;

        return $object && $object->getName() === $name ? $object : null;
    }
}
