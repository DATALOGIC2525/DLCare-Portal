'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] relative overflow-hidden p-4">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl relative z-10"
      >
        <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
          
          <CardHeader className="text-center pb-2 pt-10">
            <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">アカウント登録申請完了</CardTitle>
            <CardDescription className="text-slate-500 text-lg font-medium mt-2">
              ご登録ありがとうございます。
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 py-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg mt-1">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">サービス連携の準備中</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    ポータルサイトへのログインは即時可能ですが、**「く～chat」「ECサイト」「オンラインセミナー」**等の外部サービス連携が完了するまで、**通常1週間程度**のお時間をいただいております。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">今後の流れ</h5>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: ShieldCheck, text: "管理者が登録情報を確認します" },
                  { icon: ExternalLink, text: "各サービスのアカウント連携設定を行います" },
                  { icon: CheckCircle2, text: "完了次第、ポータル内でお知らせいたします" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <item.icon className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-10">
            <Button asChild className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 transition-all shadow-lg">
              <Link href="/login">
                ログイン画面へ戻る <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-center text-slate-400">
              ※お急ぎの場合は、各担当営業までお問い合わせください。
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
