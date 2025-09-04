import './Homepage.css'

function HomePage() {
  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        <aside className="sidebar">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-fuchsia-500" />
              <span className="font-semibold">BuildCores</span>
              <span className="text-xs text-white/50">BETA v0.18</span>
            </div>
          </div>

          <div>
            <div className="sidebar-group">Social</div>
            <a className="nav-item" href="#">Discord</a>
            <a className="nav-item" href="#">Reddit</a>
          </div>

          <div>
            <div className="sidebar-group">App</div>
            <a className="nav-item" href="#">3D Builder</a>
            <a className="nav-item" href="#">Products</a>
            <a className="nav-item" href="#">Sales</a>
            <a className="nav-item" href="#">Compare</a>
            <a className="nav-item" href="#">3D Part Gallery</a>
          </div>

          <div>
            <div className="sidebar-group">Community</div>
            <a className="nav-item" href="#">Completed Builds</a>
            <a className="nav-item" href="#">Updates</a>
            <a className="nav-item" href="#">Setup Builder</a>
          </div>

          <div className="mt-8 px-2 text-xs text-white/50">
            <div className="flex gap-3">
              <a href="#">Contact</a>
              <a href="#">GitHub</a>
              <a href="#">FAQ</a>
            </div>
          </div>
        </aside>

        <main className="main">
          <section className="hero">
            <h1 className="hero-title">Interactive PC Building in 3D</h1>
            <p className="hero-subtitle">
              Featuring compatibility, price comparison, <span className="text-fuchsia-400 font-semibold">500+ 3D models</span>, and more.
            </p>
            <div className="hero-actions">
              <a href="#" className="btn-secondary">Download Mobile App</a>
              <a href="#" className="btn-primary">Start Building</a>
            </div>
          </section>

          <div className="section-title">Quick Start</div>
          <div className="card-grid">
            {[
              { title: 'All-AMD Red Build' },
              { title: 'Baller White 4K RGB' },
              { title: 'Modern 1440p Gaming' },
            ].map((item) => (
              <article key={item.title} className="qs-card">
                <div className="qs-media" />
                <div className="qs-body">
                  <div className="qs-title">{item.title}</div>
                  <div className="qs-cta">Open</div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage


