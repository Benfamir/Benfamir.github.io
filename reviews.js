// reviews.js
const MovieReviewsAndWatchlist = () => {
    const [reviews, setReviews] = React.useState([]);
    const [watchlist, setWatchlist] = React.useState([]);
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'descending' });
    const [error, setError] = React.useState(null);
    const [selectedReview, setSelectedReview] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterOption, setFilterOption] = React.useState('all');
    const reviewsPerPage = 20;

    React.useEffect(() => {
        const sheetId = '1KAFkfG8Q0j--wtUM152ZsBv-U6lzvh8xk_u4ObK7HGM';
        const reviewsSheetName = 'Sheet1';
        const watchlistSheetName = 'Sheet2';

        const fetchData = async (sheetName, setStateFunction) => {
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.text();
                const jsonData = JSON.parse(data.substring(47).slice(0, -2));
                
                const formattedData = jsonData.table.rows.map(row => {
                    if (sheetName === reviewsSheetName) {
                        return {
                            title: row.c[0] ? row.c[0].v : '',
                            benRating: row.c[1] ? parseFloat(row.c[1].v) : null,
                            benThoughts: row.c[2] ? row.c[2].v : '',
                            benReRating: row.c[3] ? parseFloat(row.c[3].v) : null,
                            benReRatingReason: row.c[4] ? row.c[4].v : '',
                            lazaRating: row.c[5] ? parseFloat(row.c[5].v) : null,
                            lazaThoughts: row.c[6] ? row.c[6].v : '',
                            lazaReRating: row.c[7] ? parseFloat(row.c[7].v) : null,
                            lazaReRatingReason: row.c[8] ? row.c[8].v : ''
                        };
                    } else {
                        return {
                            title: row.c[0] ? row.c[0].v : '',
                        };
                    }
                });

                setStateFunction(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            }
        };

        fetchData(reviewsSheetName, setReviews);
        fetchData(watchlistSheetName, setWatchlist);
    }, []);

    const sortReviews = (key) => {
        let direction = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
        setPage(1);
    };

    const getSortedReviews = React.useMemo(() => {
        let sortableReviews = [...reviews];
        if (sortConfig.key !== null) {
            sortableReviews.sort((a, b) => {
                if (sortConfig.key === 'benRating' || sortConfig.key === 'lazaRating') {
                    return sortConfig.direction === 'ascending' 
                        ? (a[sortConfig.key] || 0) - (b[sortConfig.key] || 0)
                        : (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0);
                } else {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
            });
        }
        return sortableReviews;
    }, [reviews, sortConfig]);

    const filteredReviews = React.useMemo(() => {
        return getSortedReviews.filter(review => {
            const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase());
            const hasBenReview = review.benThoughts && review.benThoughts.trim() !== '';
            const hasLazaReview = review.lazaThoughts && review.lazaThoughts.trim() !== '';

            switch (filterOption) {
                case 'withReviews':
                    return matchesSearch && (hasBenReview || hasLazaReview);
                case 'withoutReviews':
                    return matchesSearch && !hasBenReview && !hasLazaReview;
                case 'benReviews':
                    return matchesSearch && hasBenReview;
                case 'lazaReviews':
                    return matchesSearch && hasLazaReview;
                default:
                    return matchesSearch;
            }
        });
    }, [getSortedReviews, searchTerm, filterOption]);

    const paginatedReviews = filteredReviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);

    const handleReviewClick = (review) => {
        setSelectedReview(review);
    };

    const closeModal = () => {
        setSelectedReview(null);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handleFilterChange = (event) => {
        setFilterOption(event.target.value);
        setPage(1);
    };

    const getReviewClass = (review) => {
        const hasBenReview = review.benThoughts && review.benThoughts.trim() !== '';
        const hasLazaReview = review.lazaThoughts && review.lazaThoughts.trim() !== '';

        if (hasBenReview && hasLazaReview) {
            return 'both-review';
        } else if (hasBenReview) {
            return 'ben-review';
        } else if (hasLazaReview) {
            return 'laza-review';
        }
        return '';
    };

    const ColorKey = () => (
        <div className="color-key">
            <h3>Color Key:</h3>
            <div className="key-item">
                <div className="key-color ben-review"></div>
                <span>Ben's Review</span>
            </div>
            <div className="key-item">
                <div className="key-color laza-review"></div>
                <span>Laza's Review</span>
            </div>
            <div className="key-item">
                <div className="key-color both-review"></div>
                <span>Both Reviews</span>
            </div>
            <div className="key-item">
                <div className="key-color"></div>
                <span>No Review</span>
            </div>
        </div>
    );

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Movie Reviews and Watch List</h1>
            
            <h2>Reviews</h2>
            <ColorKey />
            <div className="search-and-sort">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <div className="filter-sort-container">
                    <select onChange={handleFilterChange} value={filterOption} className="filter-select">
                        <option value="all">All Movies</option>
                        <option value="withReviews">With Reviews</option>
                        <option value="withoutReviews">Without Reviews</option>
                        <option value="benReviews">Ben's Reviews</option>
                        <option value="lazaReviews">Laza's Reviews</option>
                    </select>
                    <div className="sort-buttons">
                        <button onClick={() => sortReviews('title')}>
                            Sort by Title {sortConfig.key === 'title' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </button>
                        <button onClick={() => sortReviews('benRating')}>
                            Sort by Ben's Ratings {sortConfig.key === 'benRating' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </button>
                        <button onClick={() => sortReviews('lazaRating')}>
                            Sort by Laza's Ratings {sortConfig.key === 'lazaRating' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="reviews-grid">
                {paginatedReviews.map((review, index) => (
                    <div key={index} className={`review-card ${getReviewClass(review)}`} onClick={() => handleReviewClick(review)}>
                        <h3>{review.title}</h3>
                        <p>Ben's Rating: {review.benRating !== null ? review.benRating : 'N/A'}</p>
                        <p>Laza's Rating: {review.lazaRating !== null ? review.lazaRating : 'N/A'}</p>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</button>
                <span>Page {page} of {Math.ceil(filteredReviews.length / reviewsPerPage)}</span>
                <button onClick={() => setPage(prev => prev + 1)} disabled={page * reviewsPerPage >= filteredReviews.length}>Next</button>
            </div>

            {selectedReview && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={closeModal}>&times;</button>
                        <h2>{selectedReview.title}</h2>
                        <div className="modal-body">
                            {selectedReview.benThoughts && (
                                <div className="review-section">
                                    <h4>Ben's Rating: {selectedReview.benRating !== null ? selectedReview.benRating : 'N/A'}</h4>
                                    <p>{selectedReview.benThoughts}</p>
                                    {selectedReview.benReRating !== null && (
                                        <div className="re-rating">
                                            <h5>Re-rating: {selectedReview.benReRating}</h5>
                                            <p>{selectedReview.benReRatingReason}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {selectedReview.lazaThoughts && (
                                <div className="review-section">
                                    <h4>Laza's Rating: {selectedReview.lazaRating !== null ? selectedReview.lazaRating : 'N/A'}</h4>
                                    <p>{selectedReview.lazaThoughts}</p>
                                    {selectedReview.lazaReRating !== null && (
                                        <div className="re-rating">
                                            <h5>Re-rating: {selectedReview.lazaReRating}</h5>
                                            <p>{selectedReview.lazaReRatingReason}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <h2>Watch List</h2>
            <ul className="watchlist">
                {watchlist.map((movie, index) => (
                    <li key={index}>{movie.title}</li>
                ))}
            </ul>
        </div>
    );
};

ReactDOM.render(<MovieReviewsAndWatchlist />, document.getElementById('reviews-container'));