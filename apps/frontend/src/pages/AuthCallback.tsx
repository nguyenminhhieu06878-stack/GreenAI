import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import RoleSelectionModal from '../components/RoleSelectionModal';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [tempUser, setTempUser] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=Đăng nhập Google thất bại');
        return;
      }

      if (token) {
        try {
          // Fetch user profile with the token
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            
            // Check if user is new (needs to select role)
            if (userData.isNewUser) {
              setTempToken(token);
              setTempUser(userData);
              setShowRoleModal(true);
            } else {
              // Existing user, login directly
              login(userData, token);
              
              // Redirect based on role
              if (userData.role === 'admin') {
                navigate('/admin');
              } else if (userData.role === 'landlord') {
                navigate('/quan-ly-phong');
              } else {
                navigate('/trang-chu');
              }
            }
          } else {
            navigate('/login?error=Không thể lấy thông tin người dùng');
          }
        } catch (err) {
          console.error('Auth callback error:', err);
          navigate('/login?error=Đăng nhập thất bại');
        }
      } else {
        navigate('/login?error=Không nhận được token');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  const handleRoleComplete = async (role: 'tenant' | 'landlord') => {
    if (tempToken && tempUser) {
      try {
        // Fetch updated user data
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${tempToken}`
          }
        });

        if (response.ok) {
          const updatedUser = await response.json();
          
          // Login user with updated data
          login(updatedUser, tempToken);
          
          // Show success message with free trial info for tenants
          if (role === 'tenant') {
            toast.success('🎉 Chào mừng bạn! Bạn được tặng FREE 2 tháng Gói Cơ Bản!', {
              duration: 5000,
            });
          } else {
            toast.success('Chào mừng bạn đến với GreenEnergyAI!');
          }
          
          // Small delay to ensure state is updated
          setTimeout(() => {
            // Redirect based on selected role
            if (role === 'landlord') {
              navigate('/quan-ly-phong');
            } else {
              navigate('/trang-chu');
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching updated user:', error);
        navigate('/login?error=Cập nhật thất bại');
      }
    }
  };

  if (showRoleModal) {
    return <RoleSelectionModal token={tempToken!} onComplete={handleRoleComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
