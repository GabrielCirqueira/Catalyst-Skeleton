<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Usuario;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[AsCommand(
    name: 'app:jwt:master',
    description: 'Gera um token JWT com acesso total (Full Access) sem necessidade de usuário no banco.',
)]
final class JwtMasterCommand extends Command
{
    public function __construct(
        private readonly JWTEncoderInterface $jwtEncoder,
        private readonly ParameterBagInterface $params,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Gerador de Token JWT Master (Full Access)');

        // 1. Verificações de Ambiente
        $io->section('Passo 1: Verificações de Configuração');
        
        if (!$this->verificarConfiguracao($io)) {
            return Command::FAILURE;
        }

        $io->success('Ambiente verificado e configurado corretamente.');

        // 2. Geração do Token
        $io->section('Passo 2: Geração do Token');

        try {
            // Criamos o payload do token manualmente para garantir o acesso total e o TTL
            $now = new \DateTimeImmutable();
            $exp = $now->getTimestamp() + (30 * 60); // 30 minutos em segundos

            $payload = [
                'username' => 'master-cli',
                'roles' => ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
                'iat' => $now->getTimestamp(),
                'exp' => $exp,
            ];

            // Gera o token assinado usando o encoder do bundle
            $token = $this->jwtEncoder->encode($payload);
            
            $io->info('Identificador: master-cli');
            $io->info('Roles: ROLE_ADMIN, ROLE_SUPER_ADMIN');
            $io->info('Validade: 30 minutos (Expira em: ' . date('H:i:s', $exp) . ')');
            
            $io->success('Token gerado com sucesso!');
            $io->writeln($token);
            $io->newLine();
            $io->caution('Atenção: Este token é para uso administrativo. Não o compartilhe.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erro ao gerar o token: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function verificarConfiguracao(SymfonyStyle $io): bool
    {
        $erros = [];

        // Lemos diretamente do ambiente, sincronizado com o config/packages/lexik_jwt_authentication.yaml
        $privateKeyPath = $_ENV['JWT_SECRET_KEY'] ?? getenv('JWT_SECRET_KEY');
        $publicKeyPath = $_ENV['JWT_PUBLIC_KEY'] ?? getenv('JWT_PUBLIC_KEY');
        $passphrase = $_ENV['JWT_PASSPHRASE'] ?? getenv('JWT_PASSPHRASE');

        if (!$privateKeyPath) {
            $erros[] = 'Variável de ambiente JWT_SECRET_KEY não encontrada.';
        } elseif (!file_exists($privateKeyPath)) {
            $erros[] = sprintf('Chave privada não encontrada em: %s', $privateKeyPath);
        } elseif (!is_readable($privateKeyPath)) {
            $erros[] = sprintf('Chave privada não tem permissão de leitura: %s', $privateKeyPath);
        }

        if (!$publicKeyPath) {
            $erros[] = 'Variável de ambiente JWT_PUBLIC_KEY não encontrada.';
        } elseif (!file_exists($publicKeyPath)) {
            $erros[] = sprintf('Chave pública não encontrada em: %s', $publicKeyPath);
        }

        if (empty($passphrase)) {
            $erros[] = 'JWT_PASSPHRASE não está definida ou está vazia.';
        }

        if (count($erros) > 0) {
            foreach ($erros as $erro) {
                $io->error($erro);
            }
            return false;
        }

        return true;
    }
}
