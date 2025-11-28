import { AppContainer } from "@layouts";
import { Button } from "@shadcn/button";
import { Icon } from "@shadcn/icon";
import { Box, VStack } from "@shadcn/layout";
import { Text, Title } from "@shadcn/typography";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

export function Component() {
  return (
    <AppContainer maxWidth="2xl" paddingY="12">
      <VStack className="items-center text-center gap-8 animate-in fade-in-0 zoom-in-95 duration-700">
        <Box className="w-24 h-24 rounded-full bg-error-100 border-4 border-error-300 flex items-center justify-center animate-in zoom-in-0 duration-500">
          <Icon icon={AlertCircle} size={48} className="text-error-600" />
        </Box>

        <VStack className="gap-4">
          <Title as="h1" size="4xl" className="text-typography-900 font-bold">
            404
          </Title>
          <Title as="h2" size="xl" className="text-typography-700">
            Página não encontrada
          </Title>
          <Text className="text-typography-600 max-w-md">
            Desculpe, a página que você está procurando não existe ou foi movida. Verifique o URL ou
            volte para a página inicial.
          </Text>
        </VStack>

        <VStack className="gap-3 w-full sm:w-auto">
          <Link to="/" className="w-full">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white shadow-soft-1 transition-all hover:scale-105 flex items-center gap-2 w-full justify-center">
              <Icon icon={Home} size={18} />
              Ir para Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-outline-300 text-typography-700 hover:bg-background-100 w-full flex items-center gap-2 justify-center"
            onClick={() => window.history.back()}
          >
            <Icon icon={ArrowLeft} size={18} />
            Voltar
          </Button>
        </VStack>

        <Text className="text-typography-400 text-sm mt-8">Erro 404 · React Skeleton</Text>
      </VStack>
    </AppContainer>
  );
}
