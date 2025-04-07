import React, { useState, useEffect, useRef } from 'react';

function UserDashboard({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef, setCurrentTab, tabs }) {
  const [auditChoice, setAuditChoice] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);
  const localRef = useRef(null);
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
        headingRef.current.focus();
        lastIntendedFocusRef.current = null;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [settingsTabOpen, headingRef]);

  const toggleGroup = (group) => {
    setOpenGroup(prev => (prev === group ? null : group));
  };

  return (
    <div className="profileBlock">
      {auditChoice === null && (
        <div className="auditViewContainer" role="dialog" aria-labelledby="audit-header" aria-describedby="audit-description">
          <h2 id="audit-header" ref={headingRef} tabIndex={0} className="auditTitle">
            Welcome to the Texas A&M AIM Portal!
          </h2>
          <p tabIndex={0} aria-label="Would you like to find and download required forms or go directly to apply for accommodations?" id="audit-description" className="auditPrompt">
            Would you like to find and download required forms or go directly to apply for accommodations?
          </p>
          <div className="auditButtonGroup">
            <button onClick={() => setAuditChoice('forms')} className="auditButton">
              Find Forms
            </button>
            <p
              className="accommodationsInfoBox"
              role="note"
              aria-label="Want to apply? Click the Accommodations tab in the navigation bar."
              tabIndex={0}
            >
              Want to apply? Click the <strong>Accommodations</strong> tab in the navigation bar.
            </p>
          </div>
        </div>
      )}

      {auditChoice === 'forms' && (
        <div tabIndex={0} className="studentFormsContainer" role="region" aria-labelledby="forms-header">
          <h2 id="forms-header" tabIndex={0} className="studentFormsTitle">
            Forms and Publications for Students
          </h2>

          <div className="studentFormsAccordion">
            {[
              {
                title: 'Disability Documentation Packets',
                id: 'documentation',
                forms: [
                  { label: 'ADHD Documentation Packet', type: 'PDF', link: 'http://disability.tamu.edu/wp-content/uploads/ADHD_Packet.pdf' },
                  { label: 'Health-Related Disability Documentation Packet', type: 'PDF', link: 'http://disability.tamu.edu/wp-content/uploads/Health-Related_Disability_Packet.pdf' },
                  { label: 'Mental Health Disability Documentation Packet', type: 'PDF', link: 'http://disability.tamu.edu/wp-content/uploads/Mental_Health_Disability_Packet.pdf' },
                ]
              },
              {
                title: 'Application & Requests',
                id: 'applications',
                forms: [
                  { label: 'New Student Application (Accommodations Request Form)', type: 'Web Form', link: 'https://cascade.accessiblelearning.com/TAMU' },
                  { label: 'Requesting Accommodations', type: 'PDF', link: 'http://disability.tamu.edu/wp-content/uploads/Requesting_Accommodations.pdf' },
                  { label: 'Interpreting/Captioning Request Form', type: 'Web Form', link: 'http://disability.tamu.edu/cas/request/' },
                ]
              },
              {
                title: 'Academic Guidance & FAQ',
                id: 'guidance',
                forms: [
                  { label: 'Documentation Guidelines', type: 'PDF', link: 'http://disability.tamu.edu/documentation/' },
                  { label: 'Frequently Asked Questions', link: 'http://disability.tamu.edu/faq/' },
                  { label: 'Guidelines for Recording Lectures', link: 'http://disability.tamu.edu/facultyguide/classroom/recording-lectures/' },
                  { label: 'Guidelines for Sharing Lecture Materials', link: 'http://disability.tamu.edu/facultyguide/classroom/sharing-lecture-materials/' },
                ]
              },
              {
                title: 'Testing & Temporary Conditions',
                id: 'testing',
                forms: [
                  { label: 'Temporary Disabling Conditions Resource Handout', type: 'PDF', link: 'http://disability.tamu.edu/wp-content/uploads/Temporary_Disabilities.pdf' },
                  { label: 'Testing Center (TC) Student Reference Guide', type: 'PDF', link: 'http://disability.tamu.edu/wp-content/uploads/Student-Reference-Guide-Fall-2021.pdf' },
                  { label: 'Testing Center Reference Guide', type: 'Web Version', link: 'http://disability.tamu.edu/testrules/' },
                ]
              },
              {
                title: 'College Transition Resources',
                id: 'transition',
                forms: [
                  { label: 'Students with Disabilities Preparing for Postsecondary Education', type: 'Web Page', link: 'https://www2.ed.gov/about/offices/list/ocr/transition.html' },
                ]
              }
            ].map(group => (
              <div key={group.id} className="studentFormGroup">
                <button
                  className="studentFormToggle"
                  aria-expanded={openGroup === group.id}
                  aria-controls={`form-panel-${group.id}`}
                  onClick={() => toggleGroup(group.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGroup(group.id);
                    }
                  }}
                >
                  {group.title}
                </button>
                <ul
                  id={`form-panel-${group.id}`}
                  className="studentFormsList"
                  hidden={openGroup !== group.id}
                  role="region"
                  aria-label={group.title}
                >
                  {group.forms.map((form, index) => (
                    <li className="studentFormItem" key={index}>
                      <a href={form.link} target="_blank" rel="noopener noreferrer">
                        {form.label}
                      </a>
                      {form.type && <span className="studentFormTag">{form.type}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button className="studentFormsBackBtn" onClick={() => setAuditChoice(null)}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
