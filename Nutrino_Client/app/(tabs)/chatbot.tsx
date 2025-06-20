import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { 
  Animated, 
  Dimensions, 
  Easing, 
  KeyboardAvoidingView, 
  Platform, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Nutrino, your health AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true
      })
    ]).start();
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      startTypingAnimation();
    } else {
      typingDot1.setValue(0);
      typingDot2.setValue(0);
      typingDot3.setValue(0);
    }
  }, [isLoading]);

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot3, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponses = [
        "I understand your concern about nutrition. Let me provide some helpful information.",
        "That's a great question! Based on your profile, I'd recommend...",
        "I can help with that. Here are some dietary suggestions tailored for you:",
        "Your health is important! Let me analyze that and give you personalized advice.",
        "Thanks for sharing. Here's what I think would work best for your situation."
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const newBotMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollingUp = scrollPosition < lastScrollPosition;
    setLastScrollPosition(scrollPosition);
    setIsScrollingUp(scrollingUp);

    const shouldShowScrollButton = scrollPosition > 300;

    if (shouldShowScrollButton) {
      Animated.spring(scrollButtonAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scrollButtonAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#57cbff" />
        </Pressable>
        <Text style={styles.headerTitle}>Nutrino Chat</Text>
        <MaterialCommunityIcons name="robot-outline" size={24} color="#00E676" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {messages.map((message, index) => (
            <Animated.View 
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userContainer : styles.botContainer,
                { 
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }) 
                    }
                  ] 
                }
              ]}
            >
              {message.sender === 'bot' && index === 0 ? (
                <View style={styles.welcomeCard}>
                  <LinearGradient
                    colors={['#0a402e', '#072622']}
                    style={styles.welcomeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.welcomeHeader}>
                      <View style={styles.welcomeAvatarContainer}>
                        <View style={styles.welcomeAvatarInner}>
                          <MaterialCommunityIcons
                            name="robot-happy"
                            size={36}
                            color="#23cc96"
                          />
                        </View>
                      </View>
                      <View style={styles.welcomeTitleContainer}>
                        <Text style={styles.welcomeTitle}>Welcome to Nutrino</Text>
                        <View style={styles.welcomeSubtitleContainer}>
                          <View style={styles.onlineDot} />
                          <Text style={styles.welcomeSubtitle}>AI Health Assistant</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.welcomeText}>
                      {message.text}
                    </Text>

                    <View style={styles.welcomeDivider} />

                    <View style={styles.welcomeTips}>
                      <View style={styles.tipItem}>
                        <View style={styles.tipIconContainer}>
                          <MaterialCommunityIcons name="food-apple-outline" size={18} color="#FFD700" />
                        </View>
                        <Text style={styles.tipText}>Personalized nutrition advice</Text>
                      </View>
                      <View style={styles.tipItem}>
                        <View style={styles.tipIconContainer}>
                          <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#76FF03" />
                        </View>
                        <Text style={styles.tipText}>Dietary recommendations based on your needs</Text>
                      </View>
                      <View style={styles.tipItem}>
                        <View style={styles.tipIconContainer}>
                          <MaterialCommunityIcons name="chart-line-variant" size={18} color="#FF9800" />
                        </View>
                        <Text style={styles.tipText}>Health tracking and progress monitoring</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ) : (
                <View style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userBubble : styles.botBubble,
                ]}>
                  <LinearGradient
                    colors={message.sender === 'user' 
                      ? ['#173E19', '#0D2F10'] 
                      : ['#062350', '#0C3B69']}
                    style={styles.messageGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.messageText}>{message.text}</Text>
                    <View style={styles.messageFooter}>
                      <Text style={styles.messageTime}>
                        {formatTime(message.timestamp)}
                      </Text>
                      {message.sender === 'bot' && (
                        <TouchableOpacity style={styles.actionButton}>
                          <Ionicons name="volume-high" size={16} color="#23cc96" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </LinearGradient>
                </View>
              )}
            </Animated.View>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <BlurView intensity={80} style={styles.loadingBlur} tint="dark">
                <View style={styles.typingIndicator}>
                  <Animated.View
                    style={[
                      styles.typingDot,
                      { opacity: typingDot1 }
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.typingDot,
                      { opacity: typingDot2 }
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.typingDot,
                      { opacity: typingDot3 }
                    ]}
                  />
                </View>
              </BlurView>
            </View>
          )}
        </ScrollView>

        <Animated.View
          style={[
            styles.scrollButton,
            {
              opacity: scrollButtonAnim,
              transform: [
                {
                  scale: scrollButtonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1]
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={isScrollingUp ? scrollToTop : scrollToBottom}
            style={styles.scrollButtonInner}
            activeOpacity={0.8}
          >
            <BlurView intensity={90} style={styles.scrollButtonBlur} tint="dark">
              <LinearGradient
                colors={isScrollingUp ? ['#3b82f6', '#1d4ed8'] : ['#1c855c', '#16a34a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scrollButtonGradient}
              />
              <MaterialCommunityIcons
                name={isScrollingUp ? "arrow-up" : "arrow-down"}
                size={28}
                color="#FFF"
                style={styles.scrollButtonIcon}
              />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me about nutrition, health..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            multiline
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              { 
                backgroundColor: inputText.trim() ? '#00E676' : '#2D3748'
              }
            ]}
            disabled={!inputText.trim()}
          >
            <MaterialCommunityIcons 
              name={inputText.trim() ? "send" : "microphone"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022623',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#03302c',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.2)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  botBubble: {
    borderColor: '#1f2a30',
  },
  userBubble: {
    borderColor: '#1f2a30',
  },
  messageGradient: {
    padding: 14,
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#B0BEC5',
    opacity: 0.7,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(3, 48, 44, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(35, 204, 150, 0.3)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    backgroundColor: '#031A18',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 41, 59, 0.4)',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#2a3942',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1f2a30',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  scrollButton: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    width: 36,
    height: 36,
    zIndex: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(3, 48, 44, 0.7)',
    borderWidth: 0.7,
    borderColor: 'rgba(35, 204, 150, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(35, 204, 150, 0.3)',
  },
  scrollButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scrollButtonGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    opacity: 0.6,
  },
  scrollButtonIcon: {
    position: 'relative',
    zIndex: 1,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  loadingBlur: {
    borderRadius: 18,
    overflow: 'hidden',
    padding: 14,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#23cc96',
    marginHorizontal: 2,
  },
  welcomeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#202225',
  },
  welcomeGradient: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#23cc96',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeAvatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#4752C4',
  },
  welcomeAvatarInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  welcomeTitleContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  welcomeSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#23cc96',
    marginRight: 6,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#B9BBBE',
  },
  welcomeText: {
    fontSize: 16,
    color: '#DCDDDE',
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeDivider: {
    height: 1,
    backgroundColor: '#40444B',
    marginVertical: 16,
  },
  welcomeTips: {
    marginTop: 8,
    gap: 14,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(88, 101, 242, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(88, 101, 242, 0.3)',
  },
  tipText: {
    fontSize: 14,
    color: '#DCDDDE',
    flex: 1,
    lineHeight: 20,
  },
});