DELETE FROM role_permissions
WHERE role = 'GUEST'
  AND permission_code = 'MANAGE_ENQUIRIES';
