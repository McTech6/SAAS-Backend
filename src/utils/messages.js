// src/utils/messages.js
export const MESSAGES = {
    // --- Auth Success Messages ---
    INVITE_SUCCESS: {
        EN: "User invited successfully. Registration link sent to email.",
        FR: "Utilisateur invité avec succès. Lien d'inscription envoyé par email.",
        DE: "Benutzer erfolgreich eingeladen. Registrierungslink per E-Mail gesendet."
    },
    OTP_SENT: {
        EN: "OTP has been sent to your email",
        FR: "Le code OTP a été envoyé à votre email",
        DE: "Der OTP-Code wurde an Ihre E-Mail gesendet"
    },
    NEW_OTP_SENT: {
        EN: "New OTP sent to your email.",
        FR: "Nouveau code OTP envoyé à votre email.",
        DE: "Neuer OTP-Code an Ihre E-Mail gesendet."
    },
    EMAIL_VERIFIED: {
        EN: "Email verified successfully. You can now log in.",
        FR: "Email vérifié avec succès. Vous pouvez maintenant vous connecter.",
        DE: "E-Mail erfolgreich bestätigt. Sie können sich jetzt anmelden."
    },
    INVALID_PLAN_NAME: {
    EN: "Invalid plan name provided.",
    FR: "Nom de plan invalide fourni.",
    DE: "Ungültiger Planname angegeben."
},
ADMIN_MISSING_SUBSCRIPTION: {
    EN: "Admin has no subscription assigned.",
    FR: "L'administrateur n'a aucun abonnement attribué.",
    DE: "Admin hat kein zugewiesenes Abonnement."
},
MAX_ADMIN_LIMIT_REACHED: {
    EN: "Maximum number of admins reached for this subscription.",
    FR: "Nombre maximum d'administrateurs atteint pour cet abonnement.",
    DE: "Maximale Anzahl von Admins für dieses Abonnement erreicht."
},
MAX_AUDITOR_LIMIT_REACHED: {
    EN: "Maximum number of auditors reached for this subscription.",
    FR: "Nombre maximum d'auditeurs atteint pour cet abonnement.",
    DE: "Maximale Anzahl von Prüfern für dieses Abonnement erreicht."
},

    LOGIN_SUCCESS: {
        EN: "Login successful.",
        FR: "Connexion réussie.",
        DE: "Erfolgreich angemeldet."
    },
    PASSWORD_RESET_EMAIL_SENT: {
        EN: "Password reset email sent.",
        FR: "Email de réinitialisation du mot de passe envoyé.",
        DE: "E-Mail zum Zurücksetzen des Passworts gesendet."
    },
    PASSWORD_RESET_SUCCESS: {
        EN: "Password reset successfully.",
        FR: "Mot de passe réinitialisé avec succès.",
        DE: "Passwort erfolgreich zurückgesetzt."
    },
    PROFILE_UPDATED: {
        EN: "Profile updated successfully.",
        FR: "Profil mis à jour avec succès.",
        DE: "Profil erfolgreich aktualisiert."
    },
    PROFILE_RETRIEVED: {
        EN: "User profile retrieved successfully.",
        FR: "Profil utilisateur récupéré avec succès.",
        DE: "Benutzerprofil erfolgreich abgerufen."
    },

    // --- Auth Error Messages ---
    INVALID_USER: {
        EN: "User not found or invalid credentials.",
        FR: "Utilisateur non trouvé ou identifiants invalides.",
        DE: "Benutzer nicht gefunden oder ungültige Anmeldeinformationen."
    },
    INVALID_PASSWORD: {
        EN: "Invalid password.",
        FR: "Mot de passe invalide.",
        DE: "Ungültiges Passwort."
    },
    AUTH_REQUIRED: {
        EN: "Authentication required: Inviting user ID not found.",
        FR: "Authentification requise : ID de l'utilisateur invitant introuvable.",
        DE: "Authentifizierung erforderlich: ID des einladenden Benutzers nicht gefunden."
    },
    USER_EXISTS: {
        EN: "User with this email already exists.",
        FR: "Un utilisateur avec cet email existe déjà.",
        DE: "Benutzer mit dieser E-Mail existiert bereits."
    },
    USER_ALREADY_INVITED: {
        EN: "User with this email has already been invited. Please check their status.",
        FR: "Cet utilisateur a déjà été invité. Veuillez vérifier son statut.",
        DE: "Dieser Benutzer wurde bereits eingeladen. Bitte überprüfen Sie den Status."
    },
    INVALID_INVITE_TOKEN: {
        EN: "Invalid or expired invitation token.",
        FR: "Jeton d'invitation invalide ou expiré.",
        DE: "Ungültiger oder abgelaufener Einladungstoken."
    },
    INVALID_OTP: {
        EN: "Invalid or expired OTP.",
        FR: "Code OTP invalide ou expiré.",
        DE: "Ungültiger oder abgelaufener OTP-Code."
    },
    EMAIL_NOT_VERIFIED: {
        EN: "Please verify your email first.",
        FR: "Veuillez d'abord vérifier votre email.",
        DE: "Bitte bestätigen Sie zuerst Ihre E-Mail."
    },
    PASSWORD_REQUIRED: {
        EN: "Current password is required to change password.",
        FR: "Le mot de passe actuel est requis pour changer de mot de passe.",
        DE: "Aktuelles Passwort ist erforderlich, um das Passwort zu ändern."
    },
    PASSWORD_MISMATCH: {
        EN: "Invalid current password.",
        FR: "Mot de passe actuel invalide.",
        DE: "Ungültiges aktuelles Passwort."
    },
    REGISTRATION_INCOMPLETE: {
        EN: "Please complete your registration first.",
        FR: "Veuillez d'abord compléter votre inscription.",
        DE: "Bitte schließen Sie zuerst Ihre Registrierung ab."
    },
    
    // --- User Management Messages ---
    NOT_AUTHORIZED: {
        EN: "You are not authorized to perform this action.",
        FR: "Vous n'êtes pas autorisé à effectuer cette action.",
        DE: "Sie sind nicht berechtigt, diese Aktion durchzuführen."
    },
    USER_NOT_FOUND: {
        EN: "User not found.",
        FR: "Utilisateur introuvable.",
        DE: "Benutzer nicht gefunden."
    },
    ROLE_CHANGE_UNAUTHORIZED: {
        EN: "Only Super Admins can change user roles.",
        FR: "Seuls les Super Administrateurs peuvent modifier les rôles utilisateur.",
        DE: "Nur Super-Admins können Benutzerrollen ändern."
    },
    CANNOT_CHANGE_SUPER_ADMIN_ROLE: {
        EN: "Cannot change another Super Admin's role via this endpoint.",
        FR: "Impossible de modifier le rôle d'un autre Super Administrateur via ce point de terminaison.",
        DE: "Die Rolle eines anderen Super-Admins kann über diesen Endpunkt nicht geändert werden."
    },
    CANNOT_DEACTIVATE_SELF: {
        EN: "Cannot deactivate your own account.",
        FR: "Impossible de désactiver votre propre compte.",
        DE: "Sie können Ihr eigenes Konto nicht deaktivieren."
    },
    CANNOT_DELETE_SELF: {
        EN: "Cannot delete your own account.",
        FR: "Impossible de supprimer votre propre compte.",
        DE: "Sie können Ihr eigenes Konto nicht löschen."
    },
    USERS_RETRIEVED: {
        EN: "Users retrieved successfully.",
        FR: "Utilisateurs récupérés avec succès.",
        DE: "Benutzer erfolgreich abgerufen."
    },
    USER_DEACTIVATED: {
        EN: "User deactivated successfully.",
        FR: "Utilisateur désactivé avec succès.",
        DE: "Benutzer erfolgreich deaktiviert."
    },
    USER_REACTIVATED: {
        EN: "User reactivated successfully.",
        FR: "Utilisateur réactivé avec succès.",
        DE: "Benutzer erfolgreich reaktiviert."
    },
    USER_DELETED: {
        EN: "User deleted successfully.",
        FR: "Utilisateur supprimé avec succès.",
        DE: "Benutzer erfolgreich gelöscht."
    },
    MANAGED_USERS_RETRIEVED: {
        EN: "Managed users retrieved successfully.",
        FR: "Utilisateurs gérés récupérés avec succès.",
        DE: "Verwaltete Benutzer erfolgreich abgerufen."
    },
    // --- Audit Template Messages (NEW) ---
    TEMPLATE_CREATED: {
        EN: "Audit template created successfully.",
        FR: "Modèle d'audit créé avec succès.",
        DE: "Audit-Vorlage erfolgreich erstellt."
    },
    TEMPLATE_UPDATED: {
        EN: "Audit template updated successfully.",
        FR: "Modèle d'audit mis à jour avec succès.",
        DE: "Audit-Vorlage erfolgreich aktualisiert."
    },
    TEMPLATE_DELETED: {
        EN: "Audit template deleted successfully.",
        FR: "Modèle d'audit supprimé avec succès.",
        DE: "Audit-Vorlage erfolgreich gelöscht."
    },
    TEMPLATES_RETRIEVED: {
        EN: "Audit templates retrieved successfully.",
        FR: "Modèles d'audit récupérés avec succès.",
        DE: "Audit-Vorlagen erfolgreich abgerufen."
    },
    TEMPLATE_RETRIEVED: {
        EN: "Audit template retrieved successfully.",
        FR: "Modèle d'audit récupéré avec succès.",
        DE: "Audit-Vorlage erfolgreich abgerufen."
    },
    TEMPLATE_NOT_FOUND: {
        EN: "Audit template not found.",
        FR: "Modèle d'audit introuvable.",
        DE: "Audit-Vorlage nicht gefunden."
    },
    TEMPLATE_NAME_EXISTS: {
        EN: "An audit template with this name already exists.",
        FR: "Un modèle d'audit avec ce nom existe déjà.",
        DE: "Eine Audit-Vorlage mit diesem Namen existiert bereits."
    },
    
    // --- Subscription/Permission Error (NEW) ---
    SUBSCRIPTION_FORBIDDEN: {
        EN: "Access to this template is forbidden based on your current subscription plan.",
        FR: "L'accès à ce modèle est interdit selon votre plan d'abonnement actuel.",
        DE: "Der Zugriff auf diese Vorlage ist aufgrund Ihres aktuellen Abonnementplans untersagt."
    },
    COMPANY_CREATED: {
        EN: "Company created successfully.",
        FR: "Entreprise créée avec succès.",
        DE: "Unternehmen erfolgreich erstellt."
    },
    COMPANIES_RETRIEVED: {
        EN: "Companies retrieved successfully.",
        FR: "Entreprises récupérées avec succès.",
        DE: "Unternehmen erfolgreich abgerufen."
    },
    COMPANY_RETRIEVED: {
        EN: "Company retrieved successfully.",
        FR: "Entreprise récupérée avec succès.",
        DE: "Unternehmen erfolgreich abgerufen."
    },
    COMPANY_UPDATED: {
        EN: "Company updated successfully.",
        FR: "Entreprise mise à jour avec succès.",
        DE: "Unternehmen erfolgreich aktualisiert."
    },
    COMPANY_DELETED: {
        EN: "Company deleted successfully.",
        FR: "Entreprise supprimée avec succès.",
        DE: "Unternehmen erfolgreich gelöscht."
    },
    // Note: If you have error messages like "Company not found", they might already be handled
    // as raw strings, but for consistency, you should ensure they are mapped too.
    COMPANY_NOT_FOUND: { // Assuming this is thrown from service layer
        EN: "Company not found.",
        FR: "Entreprise introuvable.",
        DE: "Unternehmen nicht gefunden."
    },
    COMPANY_NAME_EXISTS: { // For unique constraint errors
        EN: "A company with this name already exists.",
        FR: "Une entreprise avec ce nom existe déjà.",
        DE: "Ein Unternehmen mit diesem Namen existiert bereits."
    },
    COMPANY_UPDATE_UNAUTHORIZED: { // For delete/update unauthorized errors
        EN: "You are not authorized to update this company.",
        FR: "Vous n'êtes pas autorisé à mettre à jour cette entreprise.",
        DE: "Sie sind nicht berechtigt, dieses Unternehmen zu aktualisieren."
    },
    AUDIT_INSTANCE_CREATED: {
    EN: "Audit Instance created successfully.",
    FR: "Instance d'audit créée avec succès.",
    DE: "Audit-Instanz erfolgreich erstellt."
},
AUDIT_INSTANCES_RETRIEVED: {
    EN: "Audit Instances retrieved successfully.",
    FR: "Instances d'audit récupérées avec succès.",
    DE: "Audit-Instanzen erfolgreich abgerufen."
},
AUDIT_INSTANCE_RETRIEVED: {
    EN: "Audit Instance retrieved successfully.",
    FR: "Instance d'audit récupérée avec succès.",
    DE: "Audit-Instanz erfolgreich abgerufen."
},
AUDIT_RESPONSES_SUBMITTED: {
    EN: "Audit responses submitted successfully.",
    FR: "Réponses d'audit soumises avec succès.",
    DE: "Audit-Antworten erfolgreich übermittelt."
},
AUDIT_STATUS_UPDATED: {
    EN: "Audit status updated successfully.",
    FR: "Statut d'audit mis à jour avec succès.",
    DE: "Audit-Status erfolgreich aktualisiert."
},
AUDITORS_ASSIGNED: {
    EN: "Auditors assigned successfully.",
    FR: "Auditeurs assignés avec succès.",
    DE: "Prüfer erfolgreich zugewiesen."
},
AUDIT_INSTANCE_DELETED: {
    EN: "Audit Instance deleted successfully.",
    FR: "Instance d'audit supprimée avec succès.",
    DE: "Audit-Instanz erfolgreich gelöscht."
},
  MARK_COMPLETED_UNAUTHORIZED: {
    EN: "You do not have permission to mark this audit as completed.",
    FR: "Vous n'êtes pas autorisé à marquer cet audit comme terminé.",
    DE: "Sie sind nicht berechtigt, diesen Audit als abgeschlossen zu markieren."
  },

// --- Validation/Error Messages ---
RESPONSES_NOT_ARRAY: {
    EN: "Responses must be an array.",
    FR: "Les réponses doivent être un tableau.",
    DE: "Antworten müssen ein Array sein."
},
AUDITOR_IDS_INVALID: {
    EN: "Auditor IDs must be a non-empty array.",
    FR: "Les identifiants d'auditeur doivent être un tableau non vide.",
    DE: "Prüfer-IDs müssen ein nicht leeres Array sein."
},
    // --- Generic / Fallback ---
    UNKNOWN_ERROR: {
        EN: "An unknown server error occurred.",
        FR: "Une erreur de serveur inconnue s'est produite.",
        DE: "Ein unbekannter Serverfehler ist aufgetreten."
    },
};