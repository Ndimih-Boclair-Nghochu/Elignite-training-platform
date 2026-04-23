"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, HelpCircle, Loader2, Lightbulb, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentAIHelperPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [conceptForm, setConceptForm] = useState({ concept: "", subject: "", level: "100 Level" });
  const [conceptResult, setConceptResult] = useState<{explanation:string;examples:string[];keyPoints:string[];furtherReading:string}|null>(null);
  const [docText, setDocText] = useState("");
  const [docResult, setDocResult] = useState<{summary:string;mainTopics:string[];actionItems:string[]}|null>(null);
  const [qForm, setQForm] = useState({ topic: "", subject: "", difficulty: "medium", count: "5" });
  const [qResult, setQResult] = useState<{questions:{question:string;answer:string;explanation:string}[];studyTips:string[]}|null>(null);

  async function callAI(endpoint: string, body: object) {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("AI request failed");
      return await res.json();
    } catch {
      toast({ title: "AI Error", description: "Could not process request. Please try again.", variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleExplain(e: React.FormEvent) {
    e.preventDefault();
    const result = await callAI("/api/ai/explain", conceptForm);
    if (result) setConceptResult(result);
  }

  async function handleSummarize(e: React.FormEvent) {
    e.preventDefault();
    const result = await callAI("/api/ai/summarize", { document: docText });
    if (result) setDocResult(result);
  }

  async function handleQuestions(e: React.FormEvent) {
    e.preventDefault();
    const result = await callAI("/api/ai/questions", { ...qForm, count: Number(qForm.count) });
    if (result) setQResult(result);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 p-2 rounded-lg"><Brain className="h-6 w-6 text-purple-600" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Learning Helper</h1>
          <p className="text-gray-500 text-sm">Your personal academic assistant</p>
        </div>
      </div>

      <Tabs defaultValue="explain">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="explain"><Lightbulb className="h-4 w-4 mr-1" />Explain</TabsTrigger>
          <TabsTrigger value="summarize"><FileText className="h-4 w-4 mr-1" />Summarize</TabsTrigger>
          <TabsTrigger value="questions"><HelpCircle className="h-4 w-4 mr-1" />Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="explain" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Concept Explainer</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleExplain} className="space-y-3">
                <div className="space-y-1"><Label>Concept or Topic</Label><Input placeholder="e.g. Recursion, Photosynthesis" value={conceptForm.concept} onChange={e=>setConceptForm(f=>({...f,concept:e.target.value}))} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Subject</Label><Input placeholder="e.g. Computer Science" value={conceptForm.subject} onChange={e=>setConceptForm(f=>({...f,subject:e.target.value}))} required /></div>
                  <div className="space-y-1"><Label>Level</Label><Select value={conceptForm.level} onValueChange={v=>setConceptForm(f=>({...f,level:v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["100 Level","200 Level","300 Level","400 Level"].map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading?<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Explaining...</>:<><Brain className="mr-2 h-4 w-4"/>Explain This Concept</>}</Button>
              </form>
            </CardContent>
          </Card>
          {conceptResult && (
            <Card className="border-purple-200 bg-purple-50/30">
              <CardContent className="pt-4 space-y-4">
                <div><h3 className="font-semibold mb-2">Explanation</h3><p className="text-sm text-gray-600 leading-relaxed">{conceptResult.explanation}</p></div>
                <div><h3 className="font-semibold mb-2">Examples</h3><ul className="space-y-1">{conceptResult.examples.map((ex,i)=><li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-purple-500">•</span>{ex}</li>)}</ul></div>
                <div><h3 className="font-semibold mb-2">Key Points</h3>{conceptResult.keyPoints.map((kp,i)=><div key={i} className="flex items-start gap-2 text-sm text-gray-600 mb-1"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5"/>{kp}</div>)}</div>
                <div className="bg-white rounded-lg p-3 border"><p className="text-sm font-semibold mb-1">📚 Further Reading</p><p className="text-sm text-gray-600">{conceptResult.furtherReading}</p></div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="summarize" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Document Summarizer</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSummarize} className="space-y-3">
                <div className="space-y-1"><Label>Paste your document or text</Label><Textarea placeholder="Paste lecture notes, articles, or any academic text here..." value={docText} onChange={e=>setDocText(e.target.value)} rows={8} required /></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading?<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Summarizing...</>:<><FileText className="mr-2 h-4 w-4"/>Summarize</>}</Button>
              </form>
            </CardContent>
          </Card>
          {docResult && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent className="pt-4 space-y-4">
                <div><h3 className="font-semibold mb-2">Summary</h3><p className="text-sm text-gray-600">{docResult.summary}</p></div>
                <div><h3 className="font-semibold mb-2">Main Topics</h3><div className="flex flex-wrap gap-2">{docResult.mainTopics.map((t,i)=><Badge key={i} variant="secondary">{t}</Badge>)}</div></div>
                {docResult.actionItems.length>0&&<div><h3 className="font-semibold mb-2">Action Items</h3>{docResult.actionItems.map((a,i)=><div key={i} className="flex items-start gap-2 text-sm text-gray-600 mb-1"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0"/>{a}</div>)}</div>}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Practice Question Generator</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleQuestions} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Topic</Label><Input placeholder="e.g. Linked Lists" value={qForm.topic} onChange={e=>setQForm(f=>({...f,topic:e.target.value}))} required /></div>
                  <div className="space-y-1"><Label>Subject</Label><Input placeholder="e.g. Computer Science" value={qForm.subject} onChange={e=>setQForm(f=>({...f,subject:e.target.value}))} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Difficulty</Label><Select value={qForm.difficulty} onValueChange={v=>setQForm(f=>({...f,difficulty:v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><Label>Questions</Label><Select value={qForm.count} onValueChange={v=>setQForm(f=>({...f,count:v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["3","5","10"].map(n=><SelectItem key={n} value={n}>{n} questions</SelectItem>)}</SelectContent></Select></div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading?<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating...</>:<><HelpCircle className="mr-2 h-4 w-4"/>Generate Questions</>}</Button>
              </form>
            </CardContent>
          </Card>
          {qResult && (
            <div className="space-y-4">
              {qResult.questions.map((q,i)=>(
                <Card key={i} className="border-green-200"><CardContent className="pt-4">
                  <p className="font-semibold text-sm mb-3">Q{i+1}. {q.question}</p>
                  <div className="bg-blue-50 rounded p-2"><p className="text-xs font-semibold text-blue-700 mb-1">✅ Answer: {q.answer}</p><p className="text-xs text-gray-600">{q.explanation}</p></div>
                </CardContent></Card>
              ))}
              <Card className="border-purple-200 bg-purple-50/30"><CardContent className="pt-4"><h3 className="font-semibold mb-2">💡 Study Tips</h3>{qResult.studyTips.map((tip,i)=><p key={i} className="text-sm text-gray-600 mb-1">• {tip}</p>)}</CardContent></Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
