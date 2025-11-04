function Search({searchKey, setSearchKey}){
    return (
        <div className="user_search_button">
            <input type="text" 
                className="user_search_text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}></input>
            <i className="fa-solid fa-magnifying-glass search_icon"></i>
        </div>
    )
}

export default Search;