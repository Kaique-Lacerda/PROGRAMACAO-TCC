import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';

const UserMenu = ({ onLogout }) => {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <View style={styles.userMenuContainer}>
        <TouchableOpacity
          style={styles.userMenuButton}
          onPress={() => setShowUserMenu(!showUserMenu)}
          activeOpacity={0.7}
        >
          <Text style={styles.userMenuIcon}>👤</Text>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push('/perfil');
              }}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push('/perfil?tab=configuracoes');
              }}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={handleLogout}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuText, styles.menuTextDanger]}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Overlay para fechar menu ao clicar fora */}
      {showUserMenu && (
        <TouchableOpacity 
          style={styles.menuOverlay}
          onPress={() => setShowUserMenu(false)}
          activeOpacity={1}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  userMenuContainer: {
    position: 'absolute',
    top: 32,
    right: 24,
    zIndex: 100,
  },
  userMenuButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.3)',
  },
  userMenuIcon: {
    fontSize: 20,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderRadius: 12,
    padding: 8,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#ffb300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemDanger: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  menuText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  menuTextDanger: {
    color: '#dc3545',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
});

export default UserMenu;