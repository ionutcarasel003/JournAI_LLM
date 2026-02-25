import React, { useState } from 'react';
import { Search, Book, Music, MapPin, Video, ExternalLink, Loader, Star, UserCheck, PlayCircle } from 'lucide-react';
import Button from '../components/Button';

const RECOMMENDATIONS = {
  books: [
    { id: 1, title: "Atomic Habits", author: "James Clear", type: "Dezvoltare", img: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg", link: "https://www.google.ro/books/edition/Atomic_Habits/XfFvDwAAQBAJ" },
    { id: 2, title: "Puterea Prezentului", author: "Eckhart Tolle", type: "Spiritualitate", img: "https://m.media-amazon.com/images/I/71WtsKGqf1L._AC_UF1000,1000_QL80_.jpg", link: "https://www.google.ro/books/edition/Puterea_prezentului/1" },
    { id: 3, title: "Inteligența Emoțională", author: "Daniel Goleman", type: "Psihologie", img: "https://m.media-amazon.com/images/I/713a-a1jQlL._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro/books?id=1" },
    { id: 4, title: "Gândește ca un călugăr", author: "Jay Shetty", type: "Mindfulness", img: "https://m.media-amazon.com/images/I/81s6DUyQCZL._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro" },
    { id: 5, title: "Curajul de a nu fi pe placul altora", author: "Ichiro Kishimi", type: "Filosofie", img: "https://m.media-amazon.com/images/I/71ML+p+e+WL._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro" },
    { id: 6, title: "Omul în căutarea sensului", author: "Viktor Frankl", type: "Psihologie", img: "https://m.media-amazon.com/images/I/61r-WomC0HL._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro" },
    { id: 7, title: "Cele 5 limbaje ale iubirii", author: "Gary Chapman", type: "Relații", img: "https://m.media-amazon.com/images/I/61y9CjH0uRL._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro" },
    { id: 8, title: "Arta subtilă a nepăsării", author: "Mark Manson", type: "Dezvoltare", img: "https://m.media-amazon.com/images/I/71t4GuxLCuL._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro" },
    { id: 9, title: "Sapiens", author: "Yuval Noah Harari", type: "Istorie", img: "https://m.media-amazon.com/images/I/713jIoMO3UL._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro" },
    { id: 10, title: "De ce dormim", author: "Matthew Walker", type: "Sănătate", img: "https://m.media-amazon.com/images/I/8159PM48+2L._AC_UF1000,1000_QL80_.jpg", link: "https://books.google.ro" }
  ],
  psych: [
    { id: 1, name: "Clinica Oana Nicolau", city: "București & Online", type: "Psihoterapie", link: "https://clinicaoananicolau.ro/" },
    { id: 2, name: "Atlas App", city: "Online Platform", type: "Telemedicină", link: "https://atlas.app/ro" },
    { id: 3, name: "Hedio", city: "Online", type: "Terapie AI & Human", link: "https://hedepy.ro/" },
    { id: 4, name: "DepreHub", city: "Național", type: "Helpline & Suport", link: "https://deprehub.ro/" },
    { id: 5, name: "Mind Education", city: "București", type: "Consiliere", link: "https://mindeducation.ro/" },
    { id: 6, name: "Clinica Hope", city: "Cluj / București", type: "Psihiatrie", link: "https://clinicahope.ro/" },
    { id: 7, name: "Respiro", city: "Iași", type: "Dezvoltare", link: "https://respiro.ro/" },
    { id: 8, name: "PsyLife", city: "Timișoara", type: "Clinică", link: "https://psylife.ro/" },
    { id: 9, name: "Bellanima", city: "București", type: "Centru Medical", link: "https://bellanima.ro/" },
    { id: 10, name: "I Am Fine", city: "App", type: "Self-Help App", link: "https://iamfine.app/" }
  ],
  media: [
    { id: 1, title: "Calm - Canal Oficial", type: "Canal YouTube", url: "https://www.youtube.com/c/calm" },
    { id: 2, title: "Lofi Girl - Study Beats", type: "Muzică Live", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
    { id: 3, title: "Headspace - Meditation", type: "Netflix / YouTube", url: "https://www.youtube.com/c/headspace" },
    { id: 4, title: "Sunete de Ploaie (3 Ore)", type: "Relaxare", url: "https://www.youtube.com/watch?v=mPZkdNFkNps" },
    { id: 5, title: "TED Health", type: "Podcast", url: "https://www.ted.com/topics/health" },
    { id: 6, title: "Andrew Huberman Lab", type: "Podcast Științific", url: "https://www.youtube.com/@hubermanlab" },
    { id: 7, title: "Spotify: Peaceful Piano", type: "Playlist", url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO" },
    { id: 8, title: "Documentar: The Minimalists", type: "Netflix", url: "https://www.netflix.com" },
    { id: 9, title: "Frecvențe 432Hz Vindecare", type: "Audio", url: "https://www.youtube.com/results?search_query=432hz" },
    { id: 10, title: "Yoga With Adriene", type: "Canal Yoga", url: "https://www.youtube.com/user/yogawithadriene" }
  ]
};

const DiscoverPage = () => {
  const [activeCategory, setActiveCategory] = useState('books'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}+subject:psychology&maxResults=12&langRestrict=ro`);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Eroare:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchQuery('');
    setCity('');
    setSearchResults([]); 
  };

  const handleSearchAction = () => {
    if (activeCategory === 'psych') {
        const q = city ? `psihologi buni in ${city}` : 'psihoterapeut online';
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank');
    }
    if (activeCategory === 'media') {
        window.open(`https://www.google.com/search?q=${encodeURIComponent("relaxare " + searchQuery)}&tbm=vid`, '_blank');
    }
    if (activeCategory === 'books') {
        searchBooks();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchAction();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-20 z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Descoperă Resurse</h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <CategoryButton active={activeCategory === 'books'} onClick={() => handleCategoryChange('books')} icon={Book} label="Cărți" />
          <CategoryButton active={activeCategory === 'psych'} onClick={() => handleCategoryChange('psych')} icon={UserCheck} label="Specialiști" />
          <CategoryButton active={activeCategory === 'media'} onClick={() => handleCategoryChange('media')} icon={PlayCircle} label="Media" />
        </div>

        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder={
                        activeCategory === 'books' ? "Caută o carte..." :
                        activeCategory === 'psych' ? "Introdu orașul tău..." :
                        "Caută muzică sau video..."
                    }
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-calm-primary outline-none"
                    value={activeCategory === 'psych' ? city : searchQuery}
                    onChange={(e) => activeCategory === 'psych' ? setCity(e.target.value) : setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <Button onClick={handleSearchAction}>
                {activeCategory === 'books' ? 'Caută' : 'Găsește'}
            </Button>
        </div>
      </div>

      
      <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h3 className="font-bold text-gray-700">
              {searchResults.length > 0 ? 'Rezultate Căutare' : 'Recomandările Noastre'}
          </h3>
      </div>

      {loading && <div className="text-center py-10"><Loader className="animate-spin inline text-calm-primary"/> Se caută...</div>}

      {activeCategory === 'books' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {(searchResults.length > 0 ? searchResults : RECOMMENDATIONS.books).map((book, i) => {
                  const isApi = !!book.volumeInfo;
                  const title = isApi ? book.volumeInfo.title : book.title;
                  const author = isApi ? (book.volumeInfo.authors?.[0] || 'Autor necunoscut') : book.author;
                  const img = isApi ? (book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150') : book.img;
                  const link = isApi ? book.volumeInfo.previewLink : book.link;
                  const category = isApi ? 'Carte' : book.type;

                  return (
                      <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition group">
                          <img src={img} alt={title} className="w-20 h-28 object-cover rounded-lg shadow-sm" />
                          <div className="flex flex-col justify-between flex-1">
                              <div>
                                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase font-bold">{category}</span>
                                  <h4 className="font-bold text-gray-800 mt-2 line-clamp-2 leading-tight">{title}</h4>
                                  <p className="text-xs text-gray-500">{author}</p>
                              </div>
                              <a href={link} target="_blank" className="text-xs font-bold text-calm-primary flex items-center gap-1 hover:underline mt-2">
                                  Vezi detalii <ExternalLink size={12}/>
                              </a>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      {activeCategory === 'psych' && searchResults.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RECOMMENDATIONS.psych.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-calm-primary transition group">
                      <div className="flex justify-between items-start">
                          <div>
                              <h4 className="font-bold text-gray-800">{item.name}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin size={12} /> {item.city}
                              </p>
                          </div>
                          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-semibold">{item.type}</span>
                      </div>
                      <a href={item.link} target="_blank" className="mt-4 block w-full text-center py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-600 hover:bg-calm-primary hover:text-white transition">
                          Vizitează Site
                      </a>
                  </div>
              ))}
          </div>
      )}

      {activeCategory === 'media' && searchResults.length === 0 && (
          <div className="grid grid-cols-1 gap-3">
              {RECOMMENDATIONS.media.map((item) => (
                  <a key={item.id} href={item.url} target="_blank" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition group">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${item.type.includes('Muzică') ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                              {item.type.includes('Muzică') || item.type.includes('Playlist') ? <Music size={20}/> : <Video size={20}/>}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800">{item.title}</h4>
                              <span className="text-xs text-gray-400 font-medium">{item.type}</span>
                          </div>
                      </div>
                      <ExternalLink size={18} className="text-gray-300 group-hover:text-calm-primary"/>
                  </a>
              ))}
          </div>
      )}
    </div>
  );
};

const CategoryButton = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm ${active ? 'bg-calm-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
        <Icon size={16} />
        {label}
    </button>
);

export default DiscoverPage;