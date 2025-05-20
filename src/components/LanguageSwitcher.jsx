import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    // You might want to save the language preference in localStorage
    localStorage.setItem('preferredLanguage', language);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" id="language-dropdown">
        {i18n.language === 'es' ? 'Español' : 'English'}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => changeLanguage('en')}>English</Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage('es')}>Español</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;