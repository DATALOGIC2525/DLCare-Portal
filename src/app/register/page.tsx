'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { 
  UserPlus, Building, Mail, Lock, Phone, MapPin, 
  User, ChevronRight, ChevronLeft, CheckCircle2, 
  MonitorPlay, ShoppingCart, MessageSquare, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phoneNumber: '',
    contactName: '',
    contactNameKana: '',
    email: '',
    password: '',
    department: '',
    // サービス申請関連
    requestEc: false,
    ecRepName: '',
    ecRepNameKana: '',
    ecRepEmail: '',
    requestKuchat: false,
    kuchatRepName: '',
    kuchatRepNameKana: '',
    kuchatRepEmail: '',
    kuchatPassword: '',
    requestSeminar: false,
    invoiceEmail: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/register/success');
      } else {
        const json = await res.json();
        throw new Error(json.error || '登録に失敗しました');
      }
    } catch (err: any) {
      setError(err.message);
      setStep(1); // 最初に戻るか、エラー箇所に誘導
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] relative overflow-hidden p-4 py-12">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
        
        <CardHeader className="space-y-2 pb-6 pt-8 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-800">新規アカウント作成</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-blue-600' : s < step ? 'w-4 bg-blue-200' : 'w-4 bg-slate-100'}`} 
              />
            ))}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 text-sm font-bold text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3"
                >
                  <Info className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                      <Building className="h-4 w-4 text-blue-500" />
                      企業情報の入力
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        会社名 <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="companyName" 
                        name="companyName" 
                        required 
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="株式会社データロジック" 
                        className="h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-bold" 
                      />
                      <p className="text-[10px] text-slate-400 font-medium italic">※「株式会社」や「㈱」を含めて入力してください。照合に使用します。</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        ご住所（本社所在地） <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input 
                          id="address" 
                          name="address" 
                          required 
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="東京都千代田区..." 
                          className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        代表電話番号 <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input 
                          id="phoneNumber" 
                          name="phoneNumber" 
                          required 
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="03-1234-5678" 
                          className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500" 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                      <User className="h-4 w-4 text-indigo-500" />
                      アカウント情報の入力
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="text-xs font-black text-slate-600 uppercase tracking-widest">
                          ご担当者氏名 <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="contactName" 
                          name="contactName" 
                          required 
                          value={formData.contactName}
                          onChange={handleChange}
                          placeholder="山田 太郎" 
                          className="h-11 bg-slate-50/50" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactNameKana" className="text-xs font-black text-slate-600 uppercase tracking-widest">
                          フリガナ <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="contactNameKana" 
                          name="contactNameKana" 
                          required 
                          value={formData.contactNameKana}
                          onChange={handleChange}
                          placeholder="ヤマダ タロウ" 
                          className="h-11 bg-slate-50/50" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        メールアドレス <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@company.co.jp" 
                        className="h-11 bg-slate-50/50" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        ポータル用パスワード <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        value={formData.password}
                        onChange={handleChange}
                        className="h-11 bg-slate-50/50" 
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                      <ShoppingCart className="h-4 w-4 text-emerald-500" />
                      各種サービス利用申請
                    </div>

                    {/* EC Site */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="requestEc" 
                          checked={formData.requestEc}
                          onCheckedChange={(checked) => setFormData(p => ({ ...p, requestEc: !!checked }))}
                        />
                        <Label htmlFor="requestEc" className="font-bold text-slate-700">ECサイト（データロジックダイレクト）を利用する</Label>
                      </div>
                      {formData.requestEc && (
                        <div className="pl-7 space-y-3 animate-in fade-in slide-in-from-top-2">
                          <Input name="ecRepName" placeholder="EC担当者氏名" value={formData.ecRepName} onChange={handleChange} className="h-9 text-sm" />
                          <Input name="ecRepEmail" placeholder="EC担当者メールアドレス" value={formData.ecRepEmail} onChange={handleChange} className="h-9 text-sm" />
                        </div>
                      )}
                    </div>

                    {/* Ku~chat */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="requestKuchat" 
                          checked={formData.requestKuchat}
                          onCheckedChange={(checked) => setFormData(p => ({ ...p, requestKuchat: !!checked }))}
                        />
                        <Label htmlFor="requestKuchat" className="font-bold text-slate-700">く～chatを利用する</Label>
                      </div>
                      {formData.requestKuchat && (
                        <div className="pl-7 space-y-3 animate-in fade-in slide-in-from-top-2">
                          <Input name="kuchatRepName" placeholder="チャット担当者氏名" value={formData.kuchatRepName} onChange={handleChange} className="h-9 text-sm" />
                          <Input name="kuchatPassword" type="password" placeholder="チャット専用パスワード" value={formData.kuchatPassword} onChange={handleChange} className="h-9 text-sm" />
                        </div>
                      )}
                    </div>

                    {/* Seminar */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="requestSeminar" 
                          checked={formData.requestSeminar}
                          onCheckedChange={(checked) => setFormData(p => ({ ...p, requestSeminar: !!checked }))}
                        />
                        <Label htmlFor="requestSeminar" className="font-bold text-slate-700">オンラインセミナーを申し込む</Label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pb-10 pt-6">
            <div className="flex w-full gap-4">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  className="flex-1 h-12 font-bold border-slate-200"
                  disabled={loading}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" /> 戻る
                </Button>
              )}
              <Button 
                className={`flex-[2] h-12 text-lg font-black transition-all shadow-lg ${step === 3 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`} 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    処理中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {step === 3 ? '登録を完了する' : '次へ進む'} <ChevronRight className="h-5 w-5 ml-1" />
                  </span>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-center text-slate-400 font-medium">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/login" className="text-blue-500 hover:underline font-bold">
                こちらからログイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <div className="absolute bottom-6 left-0 w-full text-center text-slate-500 text-[10px] uppercase tracking-widest z-10">
        &copy; {new Date().getFullYear()} Data Logic Co., Ltd.
      </div>
    </div>
  );
}

