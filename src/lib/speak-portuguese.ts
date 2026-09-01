export function speakPortuguese(text: string) {
  const speech = (globalThis as { speechSynthesis?: SpeechSynthesis })
    .speechSynthesis
  if (!speech) return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.rate = 0.88
  const voices = speech.getVoices()
  const brazilian =
    voices.find((voice) => voice.lang === 'pt-BR') ??
    voices.find((voice) => voice.lang.startsWith('pt'))
  if (brazilian) utterance.voice = brazilian
  speech.cancel()
  speech.speak(utterance)
}
