const errorTranslations: { [key: string]: string } = {
  'invalid_credentials': 'Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.',
  'signup_disabled': 'Momenteel zijn nieuwe accounts niet toegestaan.',
  'user_already_exists': 'Er bestaat al een account met dit e-mailadres.',
};

export const translateSupabaseError = (errorMessage: string): string => {
  return errorTranslations[errorMessage] || `${errorMessage}`;
};