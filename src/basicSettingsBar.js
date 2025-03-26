import './App.css';
import { useEffect, useState, useCallback } from 'react';

export function BasicSettingsBar({ isOpen, onClose, settings, setSettings, logout, setLoggedIn}) {
        const [scrolledPosition, setScrolledPosition] = useState(0);
        const [tempCursorColor, setTempCursorColor] = useState(settings.cursor_color);

        const scrollEvent = useCallback((e) => {
                const target = e.target;
                setScrolledPosition(target.scrollTop);
        }, []);

        const handleButtonAction = (action) => (e) => {
                e.preventDefault();
                e.stopPropagation();
                action();
                
                // Restore scroll position after state update
                setTimeout(() => {
                    document.getElementById("settingsScroll").scrollTop = scrolledPosition;
                }, 0);
        };

        const setDyslexiaSettings = async () => {
                let newSetts = {... settings};
                newSetts.font_size = "14px";
                newSetts.letter_spacing = "4.5px";
                newSetts.contrast = "50%";
                setSettings(newSetts);
        };

        const setVisualImpairmentSettings = async () => {
                let newSetts = {... settings};
                newSetts.font_size = "16px";
                newSetts.letter_spacing = "2px";
                newSetts.contrast = "200%";
                setSettings(newSetts);
        };

        const setDefaultSettings = async () => {
                let newSetts = {... settings};
                newSetts.font_size = "14px";
                newSetts.letter_spacing = "0px";
                newSetts.contrast = "100%";
                setSettings(newSetts);
        };

        const changeTxtSize = async (isInc) => {
                console.log("INSIDE HERE");
                let currTxtSize = settings.font_size;
                currTxtSize = parseInt(currTxtSize.replace("px", ""));
                if(isInc){
                        currTxtSize += 1;
                }else{
                        currTxtSize -= 1;
                }

                if(currTxtSize < 0){
                        currTxtSize = 0;
                }
                let newSetts = {... settings};
                newSetts.font_size = currTxtSize + "px";
                setSettings(newSetts);
        };

        const changeLetterSpaceSize = async (isInc) => {
                let currLS = settings.letter_spacing;
                currLS = parseInt(currLS.replace("px", ""));
                if(isInc){
                        currLS += 1;
                }else{
                        currLS -= 1;
                }

                if(currLS < 0){
                        currLS = 0;
                }
                let newSetts = {... settings};
                newSetts.letter_spacing = currLS + "px";
                setSettings(newSetts);
        };

        const changeContrast = async (isInc) => {
                let currContrast = settings.contrast;
                currContrast = parseInt(currContrast.replace("%", ""));
                if(isInc){
                        currContrast += 5;
                }else{
                        currContrast -= 5;
                }

                if(currContrast < 0){
                        currContrast = 0;
                }
                let newSetts = {... settings};
                newSetts.contrast = currContrast + "%";
                setSettings(newSetts);
        };

        const changeCursorColor = async (color) => {
                let newSetts = {... settings};
                newSetts.cursor_color = color;
                setSettings(newSetts);
        };

        BasicSettingsBar.scrolledPosition = scrolledPosition;

        return (
        <>
                <nav role="dialog" aria-label='Settings' className='settingsNav' id='settings' aria-hidden={!isOpen} onClick={(e) => {
                        e.stopPropagation();
                        }} data-testid="settings">
                <div className='innerSettingsNav'>
                <h2 className="settingsHeading"><button id="closeSettingPanel" onClick={onClose} aria-label='close' data-testid="closeSettingsBtn">x</button><p>Settings</p></h2>
                <ul onScroll={scrollEvent} id="settingsScroll" data-testid="settingsScroll">
                <li>
                        <h3>Disability Profiles</h3>
                        <ul className='disProfilesList'>
                                <li className='disProfiles'>
                                        <label>Dyslexia</label>
                                        <button onClick={setDyslexiaSettings} data-testid="dyslexiaBtn">
                                                set
                                        </button>
                                </li>
                                <li className='disProfiles'>
                                        <label>Visual Impairment</label>
                                        <button onClick={setVisualImpairmentSettings} data-testid="visImpBtn">
                                                set
                                        </button>
                                </li>
                                <li className='disProfiles'>
                                        <label>Default</label>
                                        <button onClick={setDefaultSettings} data-testid="defaultBtn">
                                                set
                                        </button>
                                </li>
                        </ul>
                </li>
                <li>
                        <h3>Text Size</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                        <button onClick={handleButtonAction(() => changeTxtSize(false))}  className='settingsBtn' aria-label='Decrease Text Size' data-testid="txtSizeDec">-</button>
                        {settings?.font_size && (
                                <label data-testid="txtSizeLabel">{settings.font_size}</label>
                        )}
                        <button onClick={handleButtonAction(() => changeTxtSize(true))} className='settingsBtn' aria-label='Increase Text Size' data-testid="txtSizeInc">+</button>
                                        </form>
                </li>
                <li>
                        <h3>Letter Spacing</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                        <button onClick={handleButtonAction(() => changeLetterSpaceSize(false))}  className='settingsBtn' aria-label='Decrease Letter Spacing' data-testid="letterSpacingDec">-</button>
                        {settings?.letter_spacing && (
                                <label data-testid="letterSpacingLabel">{settings.letter_spacing}</label>
                        )}
                        <button onClick={handleButtonAction(() => changeLetterSpaceSize(true))} className='settingsBtn' aria-label='Increase Letter Spacing' data-testid="letterSpacingInc">+</button>
                        </form>
                </li>
                <li>
                        <h3>Contrast</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                        <button onClick={handleButtonAction(() => changeContrast(false))}  className='settingsBtn' aria-label='Decrease Contrast' data-testid="contrastDec">-</button>
                        {settings?.contrast && (
                                <label data-testid="contrastLabel">{settings.contrast}</label>
                        )}
                        <button onClick={handleButtonAction(() => changeContrast(true))} className='settingsBtn' aria-label='Increase Contrast' data-testid="contrastInc">+</button>
                        </form>
                </li>
                <li>
                        <h3>Cursor Color</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                        <input type="color" name="cursor_color" value={tempCursorColor} onChange={(e) => setTempCursorColor(e.target.value)}></input>
                        <button onClick={() => changeCursorColor(tempCursorColor)} className='setBtn' aria-label='Set Cursor Color'>set</button>
                        </form>
                </li>
                <li>
                        <button onClick={() => {
                        logout(setLoggedIn);
                        }} className='logOutBtn'>log out</button>
                </li>
                </ul>
                </div>
                </nav>
        </>
        );
}

export default BasicSettingsBar;