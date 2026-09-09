/**
 * Variantes de animação para uso com Framer Motion.
 *
 * Framer Motion é um módulo opt-in na v5. Para usar estas variantes com animações:
 *   1. Ative o módulo ui-extra no setup.sh (ou: npm install framer-motion)
 *   2. Importe { motion } from 'framer-motion' e use variants={fadeInUp} etc.
 *
 * Sem framer-motion instalado, estes objetos ainda são exportados para
 * compatibilidade, mas não produzirão animações.
 *
 * @example
 * import { fadeInUp, containerStagger } from '@/shared/utils/animacoes'
 * <motion.div variants={containerStagger} initial="hidden" animate="visible">
 *   <motion.div variants={fadeInUp}>...</motion.div>
 * </motion.div>
 */

/** Entrada padrão ? elementos de página, cards, seções */
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

/** Entrada suave sem deslocamento vertical */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

/** Container para entrada em cascata (stagger) de listas de cards */
export const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

/** Spring para modais e drawers */
export const springModal = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}

/** Slide lateral ? para navegação mobile e painéis */
export function slideLateral(direcao: 'esquerda' | 'direita') {
  return {
    initial: { x: direcao === 'direita' ? '100%' : '-100%', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 28, stiffness: 280 },
    },
    exit: {
      x: direcao === 'direita' ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }
}

/** Slide vertical ? para bottom sheets e dropdowns */
export const slideDown = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}
