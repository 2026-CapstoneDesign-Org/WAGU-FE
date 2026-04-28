import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeIcon from '../../assets/icons/home.svg';
import MapIcon from '../../assets/icons/map.svg';
import MyIcon from '../../assets/icons/my.svg';
import RankingIcon from '../../assets/icons/ranking.svg';

export type AppTab = 'home' | 'ranking' | 'map' | 'my';

type BottomTabBarProps = {
  activeTab: AppTab;
  onPressHome: () => void;
  onPressMap: () => void;
  onPressMy: () => void;
  onPressRanking: () => void;
};

type TabBarItemProps = {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

export const TAB_BAR_HEIGHT = 68;

function TabBarItem({ active = false, icon, label, onPress }: TabBarItemProps) {
  return (
    <Pressable style={styles.tabItem} onPress={onPress}>
      {icon}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function BottomTabBar({
  activeTab,
  onPressHome,
  onPressMap,
  onPressMy,
  onPressRanking,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeColor = '#FF0000';
  const inactiveColor = '#9B9B9B';

  return (
    <View style={[styles.tabBar, { paddingBottom: 1 + insets.bottom }]}>
      <TabBarItem
        active={activeTab === 'home'}
        label="홈"
        onPress={onPressHome}
        icon={
          <HomeIcon
            width={23}
            height={23}
            color={activeTab === 'home' ? activeColor : inactiveColor}
          />
        }
      />
      <TabBarItem
        active={activeTab === 'ranking'}
        label="랭킹"
        onPress={onPressRanking}
        icon={
          <RankingIcon
            width={23}
            height={23}
            color={activeTab === 'ranking' ? activeColor : inactiveColor}
          />
        }
      />
      <TabBarItem
        active={activeTab === 'map'}
        label="지도"
        onPress={onPressMap}
        icon={
          <MapIcon
            width={23}
            height={23}
            color={activeTab === 'map' ? activeColor : inactiveColor}
          />
        }
      />
      <TabBarItem
        active={activeTab === 'my'}
        label="마이"
        onPress={onPressMy}
        icon={
          <MyIcon
            width={23}
            height={23}
            color={activeTab === 'my' ? activeColor : inactiveColor}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 42,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 20,
  },
  tabItem: {
    width: 36,
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    color: '#9B9B9B',
  },
  tabLabelActive: {
    color: '#FF0000',
  },
});
