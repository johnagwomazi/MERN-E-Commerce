import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import AuthInput from './AuthInput';

const PasswordInput = ({ label = 'Password', ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <AuthInput
        {...props}
        label={label}
        type={visible ? 'text' : 'password'}
        className={props.className}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-4 top-10 rounded-full p-1.5 text-ink/45 transition hover:bg-ink/5 hover:text-ink"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

export default PasswordInput;

