export default function Footer() {
  return (
    <footer className="bg-plum-dark text-sm text-cream-dark">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 sm:flex-row sm:justify-between">
        <div>
          <p className="font-heading text-lg text-cream-light">DineDesk</p>
          <p>Open every day, 12:00 pm to 11:00 pm</p>
        </div>
        <div className="sm:text-right">
          <p>14 Market Road, Near City Square</p>
          <p>Phone: 98765 43210</p>
        </div>
      </div>
      <p className="border-t border-plum-light py-3 text-center text-xs">
        Built as a project for the CODSOFT web development internship
      </p>
    </footer>
  );
}
