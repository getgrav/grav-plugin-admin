<?php
namespace Grav\Plugin\Console;

use Grav\Console\ConsoleCommand;
use Grav\Common\File\CompiledYamlFile;
use Grav\Common\User\User;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Helper\Helper;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;

/**
 * Class CleanCommand
 *
 * @package Grav\Console\Cli
 */
class NewUserCommand extends ConsoleCommand
{

    /**
     * @var array
     */
    protected $options = [];

    /**
     * Configure the command
     */
    protected function configure()
    {
        $this
            ->setName('new-user')
            ->setAliases(['add-user'])
            ->addOption(
                'user',
                'u',
                InputOption::VALUE_REQUIRED,
                'The username'
            )
            ->addOption(
                'password',
                'p',
                InputOption::VALUE_REQUIRED,
                "The password. Note that this option is not recommended because the password will be visible by users listing the processes. You should also make sure the password respects Grav's password policy."
            )
            ->addOption(
                'email',
                'e',
                InputOption::VALUE_REQUIRED,
                'The user email'
            )
            ->addOption(
                'permissions',
                'P',
                InputOption::VALUE_REQUIRED,
                'The user permissions. It can be either `a` for Admin access only, `s` for Site access only and `b` for both Admin and Site access.'
            )
            ->addOption(
                'fullname',
                'N',
                InputOption::VALUE_REQUIRED,
                'The user full name.'
            )
            ->addOption(
                'title',
                't',
                InputOption::VALUE_REQUIRED,
                'The title of the user. Usually used as a subtext. Example: Admin, Collaborator, Developer'
            )
            ->setDescription('Creates a new user')
            ->setHelp('The <info>new-user</info> creates a new user file in user/accounts/ folder')
        ;
    }

    /**
     * @return int|null|void
     */
    protected function serve()
    {
        $this->options = [
            'user'        => $this->input->getOption('user'),
            'password1'   => $this->input->getOption('password'),
            'email'       => $this->input->getOption('email'),
            'permissions' => $this->input->getOption('permissions'),
            'fullname'    => $this->input->getOption('fullname'),
            'title'       => $this->input->getOption('title')
        ];

        $this->validateOptions();

        $helper = $this->getHelper('question');
        $data   = [];

        $this->output->writeln('<green>Creating new user</green>');
        $this->output->writeln('');

        if (!$this->options['user']) {
            // Get username and validate
            $question = new Question('Enter a <yellow>username</yellow>: ', 'admin');
            $question->setValidator(function ($value) {
                return $this->validate('user', $value);
            });

            $username = $helper->ask($this->input, $this->output, $question);
        } else {
            $username = $this->options['user'];
        }


        if (!$this->options['password1']) {
            // Get password and validate
            $password = $this->askForPassword($helper, 'Enter a <yellow>password</yellow>: ', function ($password1) use ($helper) {
                $this->validate('password1', $password1);

                // Since input is hidden when prompting for passwords, the user is asked to repeat the password
                return $this->askForPassword($helper, 'Repeat the <yellow>password</yellow>: ', function ($password2) use ($password1) {
                    return $this->validate('password2', $password2, $password1);
                });
            });

            $data['password'] = $password;
        } else {
            $data['password'] = $this->options['password1'];
        }

        if (!$this->options['email']) {
            // Get email and validate
            $question = new Question('Enter an <yellow>email</yellow>:   ');
            $question->setValidator(function ($value) {
                return $this->validate('email', $value);
            });

            $data['email'] = $helper->ask($this->input, $this->output, $question);
        } else {
            $data['email'] = $this->options['email'];
        }

        if (!$this->options['permissions']) {
            // Choose permissions
            $question = new ChoiceQuestion(
                'Please choose a set of <yellow>permissions</yellow>:',
                array('a' => 'Admin Access', 's' => 'Site Access', 'b' => 'Admin and Site Access'),
                'a'
            );

            $question->setErrorMessage('Permissions %s is invalid.');
            $permissions_choice = $helper->ask($this->input, $this->output, $question);
        } else {
            $permissions_choice = $this->options['permissions'];
        }

        switch ($permissions_choice) {
            case 'a':
                $data['access']['admin'] = ['login' => true, 'super' => true];
                break;
            case 's':
                $data['access']['site'] = ['login' => true];
                break;
            case 'b':
                $data['access']['admin'] = ['login' => true, 'super' => true];
                $data['access']['site']  = ['login' => true];
        }

        if (!$this->options['fullname']) {
            // Get fullname
            $question = new Question('Enter a <yellow>fullname</yellow>: ');
            $question->setValidator(function ($value) {
                return $this->validate('fullname', $value);
            });

            $data['fullname'] = $helper->ask($this->input, $this->output, $question);
        } else {
            $data['fullname'] = $this->options['fullname'];
        }


        if (!$this->options['title'] && !count(array_filter($this->options))) {
            // Get title
            $question      = new Question('Enter a <yellow>title</yellow>:    ');
            $data['title'] = $helper->ask($this->input, $this->output, $question);
        } else {
            $data['title'] = $this->options['title'];
        }


        // Create user object and save it
        $user = new User($data);
        $file = CompiledYamlFile::instance(self::getGrav()['locator']->findResource('user://accounts/' . $username . YAML_EXT, true, true));
        $user->file($file);
        $user->save();

        $this->output->writeln('');
        $this->output->writeln('<green>Success!</green> User <cyan>' . $username . '</cyan> created.');
    }

    /**
     *
     */
    protected function validateOptions()
    {
        foreach (array_filter($this->options) as $type => $value) {
            $this->validate($type, $value);
        }
    }

    /**
     * @param        $type
     * @param        $value
     * @param string $extra
     *
     * @return mixed
     */
    protected function validate($type, $value, $extra = '')
    {
        switch ($type) {
            case 'user':
                if (!preg_match('/^[a-z0-9_-]{3,16}$/', $value)) {
                    throw new \RuntimeException('Username should be between 3 and 16 characters, including lowercase letters, numbers, underscores, and hyphens. Uppercase letters, spaces, and special characters are not allowed');
                }
                if (file_exists(self::getGrav()['locator']->findResource('user://accounts/' . $value . YAML_EXT))) {
                    throw new \RuntimeException('Username "' . $value . '" already exists, please pick another username');
                }

                break;

            case 'password1':
                if (!preg_match('/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/', $value)) {
                    throw new \RuntimeException('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters');
                }

                break;

            case 'password2':
                if (strcmp($value, $extra)) {
                    throw new \RuntimeException('Passwords did not match.');
                }

                break;

            case 'email':
                if (!preg_match('/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/', $value)) {
                    throw new \RuntimeException('Not a valid email address');
                }

                break;

            case 'permissions':
                if (!in_array($value, ['a', 's', 'b'])) {
                    throw new \RuntimeException('Permissions ' . $value . ' are invalid.');
                }

                break;

            case 'fullname':
                if ($value === null || trim($value) == '') {
                    throw new \RuntimeException('Fullname cannot be empty');
                }

                break;
        }

        return $value;
    }

    /**
     * Get password and validate.
     *
     * @param Helper   $helper
     * @param string   $question
     * @param callable $validator
     *
     * @return string
     */
    protected function askForPassword(Helper $helper, $question, callable $validator)
    {
        $question = new Question($question);
        $question->setValidator($validator);
        $question->setHidden(true);
        $question->setHiddenFallback(true);
        return $helper->ask($this->input, $this->output, $question);
    }
}