export default function NotFound() {
  return (
    <div className="pt-32 pb-16 container-x text-center">
      <div className="font-display font-bold text-[clamp(80px,18vw,180px)] text-neon leading-none">404</div>
      <h1 className="h-section mt-3">Страница не найдена</h1>
      <p className="text-muted mt-2 mb-5">Похоже, эта работа ещё не появилась в нашей студии.</p>
      <a href="/" className="btn">На главную</a>
    </div>
  );
}
