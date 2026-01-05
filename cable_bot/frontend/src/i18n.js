import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 翻译资源字典
const resources = {
  en: {
    translation: {
      // Tabs
      "tab_home": "Home",
      "tab_tools": "Tools",
      "tab_me": "Me",
      
      // Dashboard
      "welcome": "Your Electrical Expert",
      "copper_price": "Copper Price",
      "feature_calc": "Cable Sizing",
      "feature_calc_sub": "IEC Standard",
      "feature_antifake": "Anti-Fake",
      "feature_antifake_sub": "Weight Check",
      "factory_promo": "Direct form Factory. Free delivery in Phnom Penh.",
      
      // Calculator
      "calc_title": "Cable Calculator",
      "input_power": "Power Load",
      "input_distance": "Distance",
      "btn_calculate": "Calculate Now",
      "result_recommend": "Recommended Size",
      "contact_order": "Contact to Order",
      
      // Anti-Fake
      "af_title": "Weight Verification",
      "af_pass": "Official Standard (IEC)",
      "af_fail": "Risk: Substandard Cable",
      "btn_buy_real": "Buy Genuine Cable"
    }
  },
  zh: {
    translation: {
      "tab_home": "首页",
      "tab_tools": "工具箱",
      "tab_me": "我的",
      "welcome": "您的专业电气助手",
      "copper_price": "今日铜价",
      "feature_calc": "电缆选型",
      "feature_calc_sub": "IEC 标准计算",
      "feature_antifake": "防伪检测",
      "feature_antifake_sub": "称重辨真假",
      "factory_promo": "工厂直销，金边市内免费送货。",
      "calc_title": "电缆选型计算器",
      "input_power": "负载功率",
      "input_distance": "线路长度",
      "btn_calculate": "开始计算",
      "result_recommend": "推荐电缆规格",
      "contact_order": "联系工厂订购",
      "af_title": "真伪/非标检测",
      "af_pass": "IEC 国标合格",
      "af_fail": "警告：非标/铜包铝风险",
      "btn_buy_real": "购买正品电缆"
    }
  },
  km: {
    translation: {
      "tab_home": "ទំព័រដើម", // Home
      "tab_tools": "ឧបករណ៍", // Tools
      "tab_me": "គណនី", // Account/Me
      "welcome": "អ្នកជំនាញអគ្គិសនីរបស់អ្នក",
      "copper_price": "តម្លៃទង់ដែង",
      "feature_calc": "គណនាទំហំខ្សែ", // Cable Sizing
      "feature_calc_sub": "ស្តង់ដារ IEC",
      "feature_antifake": "ពិនិត្យខ្សែភ្លើង", // Check Cable
      "feature_antifake_sub": "ពិនិត្យទម្ងន់", // Check Weight
      "factory_promo": "ទិញផ្ទាល់ពីរោងចក្រ។ ដឹកជញ្ជូនឥតគិតថ្លៃក្នុងភ្នំពេញ។",
      "calc_title": "ការគណនាខ្សែភ្លើង",
      "input_power": "ថាមពល",
      "input_distance": "ចំងាយ",
      "btn_calculate": "គណនាឥឡូវនេះ",
      "result_recommend": "ទំហំខ្សែដែលណែនាំ",
      "contact_order": "ទាក់ទងមកយើងខ្ញុំ",
      "af_title": "ការផ្ទៀងផ្ទាត់ទម្ងន់",
      "af_pass": "ស្តង់ដារ IEC (ត្រឹមត្រូវ)",
      "af_fail": "ហានិភ័យ៖ ខ្សែមិនពេញ (ក្លែងក្លាយ)",
      "btn_buy_real": "ទិញខ្សែភ្លើងសុទ្ធ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh", // 默认语言
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;