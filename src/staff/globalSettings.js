// globalSettings.js
import '../App.css';
import { useState, useEffect } from 'react';

//
/*
Test cases:
 - cannot access if does not have global settings permission
 - cannot change your own global settings permissions
 - all advisors accounted for
 - changes to advisors are accounted for
 - bad search results in no advisors found.
*/

function GlobalSettings() {
  
  
  /* 
  //DONE
  step 0: create permissions in the neon
  
  step 1: get all advisors on mount
    1.1: NO NEED TO DEBOUNCE
    1.2: format: userId, Role, Name
    1.3: maybe include a loading spinner if wait time is too long?
  step 2: sort through all advisors based on searchquery
  step 3: display the first 9 advisors in card view
    3.1 no need for pagination in the query, just use a local pagination scheme
  step 4: if you click the card view, then you open an advisor's information. MAKE QUERY CALL HERE FOR PERMISSIONS
  step 5: if you decide to change advisor's perms, MAKE UPDATE QUERY CALL HERE FOR PERMISSIONS
    5.1 NO NEED TO DEBOUNCE, JUST INCLUDE A SAVE BUTTON

  */

  const [advisorList, setAdvisorList] = useState([]);
  const [loaded, setLoaded] = useState(false)
  const [simpleAdvisorList, setSimpleAdvisorList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  //============================================ USEFFECT STARTS HERE ============================================
  //============================================ USEFFECT STARTS HERE ============================================
  //============================================ USEFFECT STARTS HERE ============================================
  
  useEffect(() => {
    console.log("NUKING THE FUCK OIUT THIS AUIDBWAIOLUBDLAWKHJB");
    async function fetchAdv(){
      fetch(`/api/getAdvisors`)
      .then(response => response.json())
      .then(data=>{ 
        setAdvisorList(data.advisors || []);
        setLoaded(true);
      })
      .catch(error => console.error('error fetching advisors',error));
    }
    fetchAdv();
  },[]);

  useEffect(()=>{
    if(loaded){
      console.log("advisorList:",advisorList);
    }
  },[loaded]);

  useEffect(()=>{
    if(loaded){
        // setLoaded(false);
        console.log("advisorList",advisorList)
        let updatedSearchResults = []
        for(let i = 0; i<advisorList.length; i ++){
          if(advisorList[i].account.name.toLowerCase().includes(searchQuery.toLowerCase())){
            updatedSearchResults.push(advisorList[i]);
          }
        }
        setSearchResults(updatedSearchResults);
        // setLoaded(true);
        console.log("DONE");
    }
  },[searchQuery]);


  // },[searchQuery]);

  //============================================ SCREEN OBJECTS STARTS HERE ============================================
  //============================================ SCREEN OBJECTS STARTS HERE ============================================
  //============================================ SCREEN OBJECTS STARTS HERE ============================================

  function CardView({ advisors }) {
    const gridContainerStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 28vw)',
      gridAutoRows: '20vh', 
      gap: '16px',
      padding: '16px',
      justifyContent: 'center'
    };
    
    const cardStyle = {
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      overflow: 'hidden'
    };
    
    const nameStyle = {
      margin: '0 0 8px',
      fontSize: '1.2em'
    };
    
    const emailStyle = {
      margin: 0,
      fontSize: '0.9em',
      color: '#555'
    };
    
    const roleStyle = {
      margin: 0,
      fontSize: '0.7em',
      color: '#555'
    };

    if (!loaded) {
      return <div style={{ padding: '16px', textAlign: 'center' }}>Loading advisors...</div>;
    }

    const handleCardClick = (advisor) => {
      // Replace with your own behavior, e.g., navigate or open a modal
      console.log('Advisor clicked:', advisor);
    };
    let displayedAdvisors = [];
    //TODO: ADD SKIP AND TAKE
    if(searchQuery == ""){
      displayedAdvisors = advisorList.slice(0, 9);
    } 
    else{
      displayedAdvisors = advisors.slice(0, 9);
    }
    
  
    return (
      <div style={gridContainerStyle}>
        {displayedAdvisors.map(advisor => (
          <div 
              key={advisor.id} 
              style={cardStyle}
              onClick={() => handleCardClick(advisor)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCardClick(advisor);
              }}
          >
            <h3 style={nameStyle}>{advisor.account.name}</h3>
            <p style={emailStyle}>{advisor.account.email}</p>
            <p style={roleStyle}>{advisor.role}</p>

          </div>
        ))}
      </div>
    );
  }

  //============================================ RETURN STARTS HERE ============================================
  //============================================ RETURN STARTS HERE ============================================
  //============================================ RETURN STARTS HERE ============================================
  

  return (
    <>
      <div> {/* Title */}
        <h1>Advisor Lookup and Access Control </h1>
      </div>

      <div> {/* Searchbar */}
          <input 
            type="text"
            placeholder="Enter search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>

      <div> {/* Card View Title */}
        <h2>Current Search Query:</h2>  
      </div>

      <div> {/* Card View */}
        <CardView 
          advisors = {searchResults}
          skip = {0}
          take = {9}
        />
      </div>
    </>
  );

}

export default GlobalSettings;
