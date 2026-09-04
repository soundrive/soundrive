import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, X, ArrowLeft, Video, CheckCircle2 } from 'lucide-react';
import { Artist, TutorialLesson } from '../types';
import { BrandLogo } from './BrandLogo';
import { dbService, DEFAULT_TUTORIAL_LESSONS } from '../lib/db';

export type { TutorialLesson };
export { DEFAULT_TUTORIAL_LESSONS as OFFICIAL_TUTORIAL_LESSONS };

interface HowToUsePageProps {
  onNavigate: (view: 'landing' | 'auth' | 'dashboard' | 'public' | 'admin' | 'how_to_use', payload?: any) => void;
  currentUser: Artist | null;
  logoScale?: number;
  showLogo?: boolean;
  customLogoUrl?: string;
}

export default function HowToUsePage({
  onNavigate,
  currentUser,
  logoScale = 1.0,
  showLogo = true,
  customLogoUrl
}: HowToUsePageProps) {
  const [lessons, setLessons] = useState<TutorialLesson[]>(DEFAULT_TUTORIAL_LESSONS);
  const [selectedLesson, setSelectedLesson] = useState<TutorialLesson | null>(null);

  // Carregar aulas do Firestore (settings/tutorials) com fallback automático
  useEffect(() => {
    let isMounted = true;
    dbService.getTutorialSettings()
      .then((fetchedLessons) => {
        if (isMounted && Array.isArray(fetchedLessons) && fetchedLessons.length > 0) {
          const activeOrdered = fetchedLessons
            .filter(l => l.active !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          if (activeOrdered.length > 0) {
            setLessons(activeOrdered);
          }
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar tutoriais do Firestore, usando fallback padrão:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fechar o modal com a tecla ESC no desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLesson(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased selection:bg-[#1ed760]/30 selection:text-white">
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div 
            onClick={() => onNavigate('landing')}
            className="cursor-pointer select-none group"
            title="Ir para a página inicial"
          >
            <BrandLogo size="sm" scale={logoScale || 1.0} showLogo={showLogo} customLogoUrl={customLogoUrl} className="origin-left" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Voltar ao Painel</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Voltar ao Início</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* CABEÇALHO DA PÁGINA */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Central de Treinamento</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight uppercase text-white">
            COMO USAR O SOMDRIVE
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Aprenda do cadastro ao compartilhamento das suas músicas. Siga as aulas em ordem ou escolha o assunto que precisa.
          </p>
        </div>

        {/* GRADE DE AULAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {lessons.map((lesson, idx) => {
            const thumbnailUrl = `https://img.youtube.com/vi/${lesson.youtubeVideoId}/hqdefault.jpg`;
            const lessonNumber = String(lesson.order || idx + 1).padStart(2, '0');

            return (
              <div 
                key={lesson.id}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition group shadow-lg hover:shadow-black/60"
              >
                <div className="space-y-4">
                  {/* Thumbnail do YouTube com botão de Play sobreposto */}
                  <div 
                    onClick={() => setSelectedLesson(lesson)}
                    className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 group-hover:border-slate-700 transition cursor-pointer select-none"
                    title={`Assistir: ${lesson.title}`}
                  >
                    <img 
                      src={thumbnailUrl} 
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/70 border border-white/20 group-hover:border-[#1ed760] group-hover:bg-[#1ed760] transition duration-300 flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 text-white group-hover:text-slate-950 transition fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Badge do número da aula sobre a thumbnail */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg">
                      <span className="text-xs font-mono font-bold text-yellow-400">
                        [ {lessonNumber} ]
                      </span>
                    </div>
                  </div>

                  {/* Informações da aula */}
                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-sm sm:text-base uppercase tracking-tight text-white line-clamp-2 leading-snug">
                      {lesson.title}
                    </h3>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 pt-5 mt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setSelectedLesson(lesson)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-[#1ed760] hover:bg-[#1fdf64] text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#1ed760]/10"
                    title="Assistir incorporado no SomDrive"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Assistir Aqui</span>
                  </button>

                  <a
                    href={lesson.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                    title="Abrir no YouTube em nova aba"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">No</span> YouTube
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* MENSAGEM DE APOIO AO FINAL */}
        <div className="mt-14 sm:mt-20 p-6 sm:p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#1ed760]" />
            Dúvidas frequentes ou suporte
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Precisa de mais ajuda? Todas as funcionalidades do seu painel foram pensadas para serem simples e diretas. Se preferir, volte ao início ou acesse seu painel.
          </p>
        </div>
      </main>

      {/* MODAL / LIGHTBOX DO YOUTUBE */}
      {selectedLesson && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedLesson(null)}
        >
          <div 
            className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior do modal */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/80 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="text-xs font-mono font-bold text-yellow-400 shrink-0">
                  [ {selectedLesson.number} ]
                </span>
                <h4 className="font-heading font-black text-xs sm:text-sm text-white uppercase tracking-tight truncate">
                  {selectedLesson.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedLesson.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800/60 rounded-lg transition"
                  title="Abrir este vídeo no YouTube"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>YouTube</span>
                </a>

                <button
                  onClick={() => setSelectedLesson(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                  title="Fechar vídeo (ESC)"
                  aria-label="Fechar vídeo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Container 16:9 com o YouTube Embed */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedLesson.youtubeVideoId}?autoplay=1&rel=0`}
                title={selectedLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
