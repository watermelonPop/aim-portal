
import { useState, useEffect, useRef } from 'react';

//
/*
Test cases:
 - cannot access if does not have global settings permission
 - cannot change your own global settings permissions
 - all advisors accounted for
 - changes to advisors are accounted for
 - bad search results in no advisors found.
*/

function GlobalSettings({displayHeaderRef, settingsTabOpen, lastIntendedFocusRef}) {
  
  
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const localRef = useRef(null);
          
              // If ref is passed in (from parent), use that. Otherwise use internal.
              const headingRef = displayHeaderRef || localRef;
          
              useEffect(() => {
                  if (!headingRef.current || settingsTabOpen === true) return;
                
                  if (lastIntendedFocusRef?.current !== headingRef.current) {
                      lastIntendedFocusRef.current = headingRef.current;
                  }
              }, [settingsTabOpen, headingRef]);
                
              useEffect(() => {
                  if (!headingRef.current || settingsTabOpen === true) return;
                
                  const frame = requestAnimationFrame(() => {
                    const isAlertOpen = document.querySelector('[data-testid="alert"]') !== null;
                
                    if (
                      headingRef.current &&
                      !isAlertOpen &&
                      document.activeElement !== headingRef.current &&
                      lastIntendedFocusRef.current === headingRef.current
                    ) {
                      console.log("FOCUSING DASH");
                      console.log("Intent:", lastIntendedFocusRef.current, "Target:", headingRef.current);
                      headingRef.current.focus();
                      lastIntendedFocusRef.current = null;
                    }
                  });
                
                  return () => cancelAnimationFrame(frame);
          }, [settingsTabOpen, headingRef]);


  //============================================ USEFFECT STARTS HERE ============================================
  //============================================ USEFFECT STARTS HERE ============================================
  //============================================ USEFFECT STARTS HERE ============================================
  
  useEffect(() => {
    async function fetchAdv(){
      fetch(`/api/getAdvisors`)
      .then(response => response.json())
      .then(data=>{ 
        setAdvisorList(data.advisors || []);
        setCurrentPage(0);
        setTotalPages(Math.ceil(data.advisors.length/9));
        setLoaded(true);
      })
      .catch(error => console.error('error fetching advisors',error));
    }
      fetchAdv();
  },[]);

  useEffect(()=>{
    if(loaded){
      console.log("advisorList:",advisorList);
      // console.log("currentPages: ", currentPage);
      // console.log("totalPages: ", totalPages);

    }
  },[loaded]);

  useEffect(()=>{
    if(loaded){
        // setLoaded(false);
        //console.log("advisorList",advisorList)
        let updatedSearchResults = []
        for(let i = 0; i<advisorList.length; i ++){
          if(advisorList[i].account.name.toLowerCase().includes(searchQuery.toLowerCase())){
            updatedSearchResults.push(advisorList[i]);
          }
        }
        setSearchResults(updatedSearchResults);
        //set current page to 0
        setCurrentPage(0);
        setTotalPages(Math.ceil(updatedSearchResults.length/9));

        // setLoaded(true);
        // console.log("searchResults:",updatedSearchResults);
        // console.log("DONE");
    }
  },[searchQuery]);

  // useEffect(()=>{
  //   if(loaded){
  //     const current_page_index = currentPage * 9
  //     const next_page_index = (currentPage + 1) * 9
  //     setSlicedSearchResults(searchResults.slice(current_page_index, next_page_index));
  //   }
  // },[s,currentPage]);




  // },[searchQuery]);

  //============================================ SCREEN OBJECTS STARTS HERE ============================================
  //============================================ SCREEN OBJECTS STARTS HERE ============================================
  //============================================ SCREEN OBJECTS STARTS HERE ============================================

  function CardView({ advisors, skip, take }) {
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
      // console.log('Advisor clicked:', advisor);
      setSelectedAdvisor(advisor);
      // console.log("advisor selected!");
    };
    let displayedAdvisors = [];
    //TODO: ADD SKIP AND TAKE
    if(searchQuery == ""){
      displayedAdvisors = advisorList.slice(skip, take);
    } 
    else{
      displayedAdvisors = advisors.slice(skip, take);
    }
  
    return (
      <div style={gridContainerStyle}>
        {displayedAdvisors.map(advisor => (
          <div 
              key={advisor.id} // Key is here
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

  //============================================ PAGINATION BUTTONS ============================================
  function PaginationButtons() {
    const onPageChange = (page_update) =>{
      // console.log("onPageChange with page: ", page_update);

      if(page_update < 0){
        if(currentPage != 0){
          setCurrentPage(currentPage-1);
        }
      }
      else{
        if(currentPage != totalPages - 1){
          setCurrentPage(currentPage+1);
        }
      }

      // console.log("currentPage: ", currentPage);
      // console.log("totalPages: ", totalPages);

    }
    
    return (
      <div className="pagination-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
        <button 
          onClick={() => onPageChange(-1)} 
          disabled={currentPage === 0}
        >
          Prev
        </button>
        
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === totalPages-1}
        >
          Next
        </button>
      </div>
    );
  }

  //============================================ ADVISOR CARD ============================================
  
  function AdvisorCard({ advisor, onClose }) {
    // Assume advisor.permissions holds an array of permission strings (or set an empty array if not available)
    //use selectedAdvisor an 
    const temp_advisor_perms = [advisor.global_settings, advisor.accessible_testing_modules, advisor.accomodation_modules, advisor.assistive_technology_modules, advisor.note_taking_modules, advisor.student_case_information];
    const [permissions, setPermissions] = useState( [...temp_advisor_perms] || []);
    
    //redo permissions
    
  
    // Example available permissions; in a real app this might come from your backend or context
    const availablePermissions = ['Global Settings', 'Accessible Testing', 'Accommodation Modules', 'Assistive Technologies', 'Note Taking Modules', 'Student Case Information'];

    //let curr_advisor_perms = [advisor.global_settings, advisor.accessible_testing_modules, advisor.accomodation_modules, advisor.assistive_technology_modules, advisor.note_taking_modules, advisor.student_case_information];
    // const onClose = () => {};
    // console.log("CURRADVISORPERMS:",permissions);


    const handleCheckboxChange = (perm_no) => {
        let new_perms = [...permissions];
        new_perms[perm_no] = !new_perms[perm_no];
        setPermissions(new_perms);
        // console.log("updated permissions after checkbox change:",permissions);
    };
  
    const handleSave = () => {
      setIsSaving(true);
      setSelectedAdvisor(prev => ({
        ...prev,
        global_settings: permissions[0],
        accessible_testing_modules: permissions[1],
        accomodation_modules: permissions[2],
        assistive_technology_modules: permissions[3],
        note_taking_modules:  permissions[4],
        student_case_information: permissions[5],
      }));
      //setLoaded(false);
      // Update permissions to the database via your API endpoint
      fetch(`/api/updateAdvisors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advisorId: advisor.userId, permissions })
      })
        .then(response => response.json())
        .then(data => {
          // console.log('Permissions updated:', data);
          setIsSaving(false);
          // Optionally update advisor in parent state here
          setAdvisorList(prevList => {
            // Create a new array from the previous state
            const updatedList = [...prevList];
            const index = updatedList.findIndex(item => item.userId === advisor.userId);
            if (index !== -1) {
              updatedList[index] = {
                ...updatedList[index],
                global_settings: permissions[0],
                accessible_testing_modules: permissions[1],
                accomodation_modules: permissions[2],
                assistive_technology_modules: permissions[3],
                note_taking_modules:  permissions[4],
                student_case_information: permissions[5],
              };
            }
            return updatedList;
          });

          setSaveSuccess('Settings saved successfully!');
          // Clear the message after 3 seconds
          setTimeout(() => {
            setSaveSuccess('');
          }, 3000);
          // const updatedAdvisor = advisorList.find(item => item.userId === advisor.userId);
          // setSelectedAdvisor(updatedAdvisor);
          //onClose(); // Close the detailed card view after saving
        })
        .catch(error => {
          console.error('Error updating permissions:', error);
          setIsSaving(false);
        });
    };
  
    const detailCardStyle = {
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '30px',
      margin: '20px',
      textAlign: 'center'
    };
  
    return (
      <div style={detailCardStyle}>
        <h2>{advisor.account.name}</h2>
        <p>ID: {advisor.userId}</p>
        <p>Email: {advisor.account.email}</p>
        <p>Role: {advisor.role}</p>
        <h3>Permissions</h3>
        <div style={{ textAlign: 'left', display: 'inline-block' }}>
          {availablePermissions.map((perm) => (
            <label
              key={perm}
              style={{
                display: 'block',
                margin: '8px 0',
                fontSize: '1.1em'
              }}
            >
              <input
                type="checkbox"
                style={{
                  transform: 'scale(1.8)',
                  marginRight: '8px'
                }}
                checked={permissions[availablePermissions.indexOf(perm)]}
                onChange={() => handleCheckboxChange(availablePermissions.indexOf(perm))}
              />
              {perm}
            </label>
          ))}
        </div>
        

        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <button onClick={handleSave} disabled={isSaving} style={{ marginRight: '16px' }}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose}>Back to Results</button>
          </div>
          {saveSuccess && (
            <p style={{ color: 'green', margin: 0 }}>
              {saveSuccess}
            </p>
          )}
        </div>
      </div>
    );
  }

  //============================================ RETURN STARTS HERE ============================================
  //============================================ RETURN STARTS HERE ============================================
  //============================================ RETURN STARTS HERE ============================================
  

  return (
    <>
      <div> {/* Title */}
        <h2 ref={headingRef}
                        tabIndex={0}>Advisor Lookup and Access Control </h2>
      </div>

      <div> {/* Searchbar */}
          <input 
            type="text"
            placeholder="Enter Advisor Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>

      <div> {/* Card View Title */}
      {selectedAdvisor ? (
        <h2>Edit Advisor Permissions:</h2>  
      ):(
        <h2>Search Results:</h2>  
      )}
      </div>

      <div> {/* Card View */}
        {selectedAdvisor ? (
          <AdvisorCard 
            advisor={selectedAdvisor} 
            onClose={() => setSelectedAdvisor(null)} 
          />
        ) : (
          <CardView 
            advisors = {searchResults}
            skip = {currentPage * 9}
            take = {(currentPage + 1) * 9}
          />
        )}
      </div>

      <div>
      {selectedAdvisor ? null : (
        <PaginationButtons/>
      )}
      </div>
    </>
  );

}

export default GlobalSettings;
