const EmailList: React.FC = () => {
  return (
    <div 
      role="feed" 
      aria-busy={loading}
      aria-label="Email list"
    >
      {emails.map(email => (
        <article 
          key={email.id}
          aria-labelledby={`email-${email.id}-title`}
        >
          {/* Email content */}
        </article>
      ))}
    </div>
  );
}; 