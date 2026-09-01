export function speakPortuguese(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.rate = 0.88
  const voices = window.speechSynthesis.getVoices()
  const brazilian =
    voices.find((voice) => voice.lang === 'pt-BR') ??
    voices.find((voice) => voice.lang.startsWith('pt'))
  if (brazilian) utterance.voice = brazilian
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
