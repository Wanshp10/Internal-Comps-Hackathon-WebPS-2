export default function SearchBar({ value, onChange, placeholder = "Search services…", onSubmit }) {
  return <form className="searchbar" onSubmit={onSubmit || (e => e.preventDefault())}>
    <span aria-hidden="true">⌕</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    <button className="btn btn-primary" type="submit" aria-label="Search">→</button>
  </form>;
}