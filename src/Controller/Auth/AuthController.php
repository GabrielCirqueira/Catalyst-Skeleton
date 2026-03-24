<?php

declare(strict_types=1);

namespace App\Controller\Auth;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth', name: 'auth_')]
final class AuthController extends AbstractController
{
    public function __construct(
        private readonly UsuarioRepository $usuarioRepository,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /**
     * Registra um novo usuário.
     *
     * Body: { "nomeCompleto": string, "username": string, "senha": string }
     */
    #[Route('/registro', name: 'registro', methods: ['POST'])]
    public function registro(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $dados */
        $dados = json_decode($request->getContent(), true) ?? [];

        $erros = $this->validarRegistro($dados);
        if (count($erros) > 0) {
            return $this->json(['sucesso' => false, 'erros' => $erros], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $nomeCompleto = trim((string) ($dados['nomeCompleto'] ?? ''));
        $username = mb_strtolower(trim((string) ($dados['username'] ?? '')));
        $senha = (string) ($dados['senha'] ?? '');

        if ($this->usuarioRepository->usernameJaExiste($username)) {
            return $this->json(
                ['sucesso' => false, 'erros' => ['username' => 'Este nome de usuário já está em uso.']],
                Response::HTTP_CONFLICT,
            );
        }

        $usuario = new Usuario($nomeCompleto, $username);
        $usuario->setPassword($this->hasher->hashPassword($usuario, $senha));

        $this->usuarioRepository->salvar($usuario);

        return $this->json([
            'sucesso' => true,
            'mensagem' => 'Cadastro realizado com sucesso. Faça login para continuar.',
        ], Response::HTTP_CREATED);
    }

    /**
     * Retorna os dados do usuário autenticado.
     *
     * Requer Bearer token JWT no header Authorization.
     */
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();

        return $this->json([
            'id' => $usuario->getId(),
            'nomeCompleto' => $usuario->getNomeCompleto(),
            'username' => $usuario->getUsername(),
            'roles' => $usuario->getRoles(),
            'criadoEm' => $usuario->getCriadoEm()->format(\DateTimeInterface::ATOM),
        ]);
    }

    /** @param array<string, mixed> $dados
     * @return array<string, string>
     */
    private function validarRegistro(array $dados): array
    {
        $constraints = new Assert\Collection([
            'nomeCompleto' => [
                new Assert\NotBlank(message: 'O nome completo é obrigatório.'),
                new Assert\Length(min: 3, max: 255, minMessage: 'O nome deve ter ao menos 3 caracteres.'),
            ],
            'username' => [
                new Assert\NotBlank(message: 'O nome de usuário é obrigatório.'),
                new Assert\Length(min: 3, max: 100, minMessage: 'O usuário deve ter ao menos 3 caracteres.'),
                new Assert\Regex(
                    pattern: '/^[a-zA-Z0-9._%+-@]+$/',
                    message: 'O usuário só pode conter letras, números, pontos, hífens, underscores e o símbolo @.',
                ),
            ],
            'senha' => [
                new Assert\NotBlank(message: 'A senha é obrigatória.'),
                new Assert\Length(min: 8, minMessage: 'A senha deve ter ao menos 8 caracteres.'),
            ],
        ]);

        $violations = $this->validator->validate($dados, $constraints);

        $erros = [];
        foreach ($violations as $violation) {
            $campo = str_replace(['[', ']'], '', (string) $violation->getPropertyPath());
            $erros[$campo] = $violation->getMessage();
        }

        return $erros;
    }
}
