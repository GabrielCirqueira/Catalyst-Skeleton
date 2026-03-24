<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:seed',
    description: 'Popula o banco de dados com dados iniciais (admin, usuário, etc.) para desenvolvimento.',
)]
final class AppSeedCommand extends Command
{
    public function __construct(
        private readonly UsuarioRepository $usuarioRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Iniciando Seeding do Banco de Dados');

        try {
            $this->criarUsuarios($io);

            $io->success('Banco de dados populado com sucesso!');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erro durante o seeding: '.$e->getMessage());

            return Command::FAILURE;
        }
    }

    private function criarUsuarios(SymfonyStyle $io): void
    {
        if ($this->usuarioRepository->usernameJaExiste('admin@projeto.com')) {
            $io->note('Usuários de exemplo já existem. Pulando...');

            return;
        }

        $admin = new Usuario('Administrador Supremo', 'admin@projeto.com');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'senha123'));
        $admin->setRoles(['ROLE_ADMIN']);
        $this->usuarioRepository->salvar($admin, false);

        $user = new Usuario('Usuário de Teste', 'user@projeto.com');
        $user->setPassword($this->passwordHasher->hashPassword($user, 'senha123'));
        $user->setRoles(['ROLE_USER']);
        $this->usuarioRepository->salvar($user, true);

        $io->writeln('   ✓ Criados usuários padrões: admin@projeto.com e user@projeto.com (senha: senha123)');
    }
}
