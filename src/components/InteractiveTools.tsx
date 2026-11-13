import React, { useState } from 'react';
import { 
  Calculator, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Sliders, 
  DollarSign, 
  Minimize2 
} from 'lucide-react';
import type { SimulatorType } from '../types/curriculum';

interface InteractiveToolsProps {
  initialTab?: SimulatorType;
  standalone?: boolean;
}

export const InteractiveTools: React.FC<InteractiveToolsProps> = ({
  initialTab = 'kv-cache',
  standalone = true
}) => {
  const [activeTab, setActiveTab] = useState<SimulatorType>(initialTab);

  // --- TAB 1: KV-Cache State ---
  const [modelParams, setModelParams] = useState<number>(8); // 8B
  const [precisionBytes, setPrecisionBytes] = useState<number>(2); // 2 bytes (FP16)
  const [contextLength, setContextLength] = useState<number>(8192);
  const [batchSize, setBatchSize] = useState<number>(8);
  const numLayers = 32;
  const numHeadsKV = 8;
  const headDim = 128;

  const modelVramGB = (modelParams * 1e9 * precisionBytes) / (1024 ** 3);
  const kvCacheBytes = 2 * numLayers * numHeadsKV * headDim * contextLength * batchSize * precisionBytes;
  const kvCacheGB = kvCacheBytes / (1024 ** 3);
  const totalVramGB = modelVramGB + kvCacheGB;

  // --- TAB 2: LoRA State ---
  const [loraBaseParams, setLoraBaseParams] = useState<number>(8);
  const [loraRank, setLoraRank] = useState<number>(16);
  const [loraTargetAll, setLoraTargetAll] = useState<boolean>(true);
  
  const hiddenDim = 4096;
  const matricesPerLayer = loraTargetAll ? 7 : 2;
  const trainableParams = 32 * matricesPerLayer * (2 * hiddenDim * loraRank);
  const trainableMillion = trainableParams / 1e6;
  const baseParamPercent = (trainableParams / (loraBaseParams * 1e9)) * 100;
  const adamVramMB = (trainableParams * 8) / (1024 ** 2);
  const fullFinetuneAdamGB = (loraBaseParams * 1e9 * 8) / (1024 ** 3);

  // --- TAB 3: Vector Sandbox State ---
  const [v1, setV1] = useState<[number, number, number]>([0.8, 0.4, 0.1]);
  const [v2, setV2] = useState<[number, number, number]>([0.7, 0.5, -0.2]);

  const dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
  const mag1 = Math.sqrt(v1[0]**2 + v1[1]**2 + v1[2]**2);
  const mag2 = Math.sqrt(v2[0]**2 + v2[1]**2 + v2[2]**2);
  const cosineSim = (mag1 > 0 && mag2 > 0) ? dot / (mag1 * mag2) : 0;
  const euclideanDist = Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2 + (v1[2]-v2[2])**2);

  // --- TAB 4: ReAct Stepper State ---
  const [reactStep, setReactStep] = useState<number>(0);
  const reactTrace = [
    { type: "goal", label: "User Goal", text: "Investigate why customer 9021 was charged $120 twice and issue a single refund." },
    { type: "thought", label: "Step 1: Thought", text: "I need to query the billing transaction history for customer 9021 to inspect duplicate invoice IDs." },
    { type: "action", label: "Step 2: Action", text: "CALL TOOL: stripe_query_charges(customer_id='9021', limit=5)" },
    { type: "observation", label: "Step 3: Environment Observation", text: "HOST RETURN: [{'id': 'ch_01', 'amount': 120.0, 'time': '10:04:12'}, {'id': 'ch_02', 'amount': 120.0, 'time': '10:04:14'}] (Duplicate charges detected 2 seconds apart)." },
    { type: "thought", label: "Step 4: Thought", text: "Charge ch_02 is an exact duplicate. I must refund ch_02 with idempotency key 'refund_9021_ch02' to prevent double refunds." },
    { type: "action", label: "Step 5: Action", text: "CALL TOOL: stripe_issue_refund(charge_id='ch_02', reason='duplicate_charge', idempotency_key='refund_9021_ch02')" },
    { type: "observation", label: "Step 6: Environment Observation", text: "HOST RETURN: {'status': 'succeeded', 'refund_id': 're_98829', 'amount': 120.0}" },
    { type: "final", label: "Step 7: Final Answer", text: "Confirmed duplicate charge ch_02 of $120.00 was issued at 10:04:14. A full refund of $120.00 has been processed successfully (Refund ID: re_98829)." }
  ];

  // --- NEW TAB 5: RRF Fusion Visualizer State ---
  const [bm25Rank, setBm25Rank] = useState<number>(2);
  const [denseRank, setDenseRank] = useState<number>(5);
  const [rrfK, setRrfK] = useState<number>(60);
  const [bm25Weight, setBm25Weight] = useState<number>(1.0);
  const [denseWeight, setDenseWeight] = useState<number>(1.0);

  const bm25ScorePart = bm25Weight * (1 / (rrfK + bm25Rank));
  const denseScorePart = denseWeight * (1 / (rrfK + denseRank));
  const totalRrfScore = bm25ScorePart + denseScorePart;

  // --- NEW TAB 6: Context Window & Compaction Inspector State ---
  const [maxWindow, setMaxWindow] = useState<number>(32768);
  const [systemPromptTokens, setSystemPromptTokens] = useState<number>(1500);
  const [pinnedMemoryTokens, setPinnedMemoryTokens] = useState<number>(2500);
  const [toolPayloadTokens, setToolPayloadTokens] = useState<number>(14000);
  const [userTurnsTokens, setUserTurnsTokens] = useState<number>(8000);
  const [isCompacted, setIsCompacted] = useState<boolean>(false);

  const effectiveToolTokens = isCompacted ? Math.round(toolPayloadTokens * 0.25) : toolPayloadTokens;
  const effectiveUserTokens = isCompacted ? Math.round(userTurnsTokens * 0.40) : userTurnsTokens;
  const totalOccupiedTokens = systemPromptTokens + pinnedMemoryTokens + effectiveToolTokens + effectiveUserTokens;
  const occupancyPercent = Math.min(100, (totalOccupiedTokens / maxWindow) * 100);
  const kvCachePrefixHitRate = isCompacted ? 85 : 45;

  // --- NEW TAB 7: FDE Unit Economics & Cascade Calculator State ---
  const [dailyActiveUsers, setDailyActiveUsers] = useState<number>(25000);
  const [queriesPerUserDay, setQueriesPerUserDay] = useState<number>(4);
  const [avgPromptTok, setAvgPromptTok] = useState<number>(1800);
  const [avgOutputTok, setAvgOutputTok] = useState<number>(350);
  const [cacheHitPercent, setCacheHitPercent] = useState<number>(35);
  const [slmRoutePercent, setSlmRoutePercent] = useState<number>(75);

  const monthlyQueries = dailyActiveUsers * queriesPerUserDay * 30;
  const uncachedMonthlyQueries = monthlyQueries * (1 - cacheHitPercent / 100);
  
  const slmQueries = uncachedMonthlyQueries * (slmRoutePercent / 100);
  const frontierQueries = uncachedMonthlyQueries * (1 - slmRoutePercent / 100);

  const slmCost = slmQueries * ((avgPromptTok / 1e6 * 0.20) + (avgOutputTok / 1e6 * 0.20));
  const frontierCost = frontierQueries * ((avgPromptTok / 1e6 * 2.50) + (avgOutputTok / 1e6 * 10.00));
  const totalAiCostMonth = slmCost + frontierCost;
  const humanSupportCostMonth = (monthlyQueries * 0.15) * 4.50; // assuming 15% of tickets would require a $4.50 human agent
  const netLaborSavings = Math.max(0, humanSupportCostMonth - totalAiCostMonth);
  const p99LatencySeconds = (slmRoutePercent / 100) * 0.35 + (1 - slmRoutePercent / 100) * 2.8;

  return (
    <div className={`interactive-container ${!standalone ? 'embedded' : ''}`}>
      {standalone && (
        <div className="interactive-header">
          <div className="flex items-center gap-2">
            <Calculator className="text-emerald-500" size={24} />
            <h2>First-Principles Interactive Simulators</h2>
          </div>
          <p className="text-muted">
            Mathematical sandboxes to calculate hardware budgets, adapter sizing, vector geometry, agent traces, RRF fusion, and unit economics.
          </p>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="tab-pill-bar">
        <button
          className={`tab-pill ${activeTab === 'kv-cache' ? 'active' : ''}`}
          onClick={() => setActiveTab('kv-cache')}
        >
          <Sliders size={14} className="inline mr-1" /> KV-Cache & VRAM
        </button>
        <button
          className={`tab-pill ${activeTab === 'lora' ? 'active' : ''}`}
          onClick={() => setActiveTab('lora')}
        >
          <Minimize2 size={14} className="inline mr-1" /> LoRA Adapter Math
        </button>
        <button
          className={`tab-pill ${activeTab === 'vector' ? 'active' : ''}`}
          onClick={() => setActiveTab('vector')}
        >
          <Layers size={14} className="inline mr-1" /> Vector Geometry
        </button>
        <button
          className={`tab-pill ${activeTab === 'react-loop' ? 'active' : ''}`}
          onClick={() => setActiveTab('react-loop')}
        >
          <Play size={14} className="inline mr-1" /> ReAct Agent Loop
        </button>
        <button
          className={`tab-pill ${activeTab === 'rrf-fusion' ? 'active' : ''}`}
          onClick={() => setActiveTab('rrf-fusion')}
        >
          ⚡ RRF Hybrid Fusion
        </button>
        <button
          className={`tab-pill ${activeTab === 'context-compaction' ? 'active' : ''}`}
          onClick={() => setActiveTab('context-compaction')}
        >
          🔍 Context Compaction
        </button>
        <button
          className={`tab-pill ${activeTab === 'fde-economics' ? 'active' : ''}`}
          onClick={() => setActiveTab('fde-economics')}
        >
          <DollarSign size={14} className="inline mr-1" /> FDE Unit Economics
        </button>
      </div>

      <div className="interactive-card">
        {/* TAB 1: KV-CACHE SIZER */}
        {activeTab === 'kv-cache' && (
          <div className="tool-grid">
            <div className="tool-inputs">
              <h3>Model & Serving Configuration</h3>
              <div className="input-group">
                <label>Model Parameter Count: <strong>{modelParams} Billion</strong></label>
                <div className="btn-group">
                  {[7, 8, 14, 70].map(p => (
                    <button
                      key={p}
                      className={`btn-select ${modelParams === p ? 'selected' : ''}`}
                      onClick={() => setModelParams(p)}
                    >
                      {p}B
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Precision / Quantization:</label>
                <div className="btn-group">
                  <button className={`btn-select ${precisionBytes === 2 ? 'selected' : ''}`} onClick={() => setPrecisionBytes(2)}>FP16 (2B)</button>
                  <button className={`btn-select ${precisionBytes === 1 ? 'selected' : ''}`} onClick={() => setPrecisionBytes(1)}>INT8 (1B)</button>
                  <button className={`btn-select ${precisionBytes === 0.5 ? 'selected' : ''}`} onClick={() => setPrecisionBytes(0.5)}>INT4 (0.5B)</button>
                </div>
              </div>

              <div className="input-group">
                <label>Context Length: <strong>{contextLength.toLocaleString()} tokens</strong></label>
                <input type="range" min="2048" max="65536" step="2048" value={contextLength} onChange={e => setContextLength(Number(e.target.value))} />
              </div>

              <div className="input-group">
                <label>Concurrent Batch Size: <strong>{batchSize} requests</strong></label>
                <input type="range" min="1" max="64" step="1" value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} />
              </div>
            </div>

            <div className="tool-results">
              <h3>VRAM Allocation Breakdown</h3>
              <div className="stat-card">
                <span className="stat-label">Model Weights VRAM</span>
                <span className="stat-value">{modelVramGB.toFixed(1)} GB</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">KV-Cache VRAM</span>
                <span className="stat-value text-emerald-400">{kvCacheGB.toFixed(1)} GB</span>
              </div>
              <div className="stat-card highlight">
                <span className="stat-label">Total GPU VRAM Required (with 15% buffer)</span>
                <span className="stat-value total">{(totalVramGB * 1.15).toFixed(1)} GB</span>
              </div>
              <div className="hardware-check">
                <div className="hw-badge-list">
                  <span className={`hw-badge ${totalVramGB * 1.15 <= 24 ? 'pass' : 'fail'}`}>
                    RTX 4090 / A10G (24 GB): {totalVramGB * 1.15 <= 24 ? '✓ Fits' : '✗ OOM'}
                  </span>
                  <span className={`hw-badge ${totalVramGB * 1.15 <= 80 ? 'pass' : 'fail'}`}>
                    NVIDIA A100 / H100 (80 GB): {totalVramGB * 1.15 <= 80 ? '✓ Fits' : '✗ Multi-GPU'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LORA SIZER */}
        {activeTab === 'lora' && (
          <div className="tool-grid">
            <div className="tool-inputs">
              <h3>LoRA Adapter Configuration</h3>
              <div className="input-group">
                <label>Base Model Size: <strong>{loraBaseParams} Billion Parameters</strong></label>
                <div className="btn-group">
                  {[7, 8, 14, 70].map(p => (
                    <button key={p} className={`btn-select ${loraBaseParams === p ? 'selected' : ''}`} onClick={() => setLoraBaseParams(p)}>{p}B</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>LoRA Rank (r): <strong>{loraRank}</strong></label>
                <input type="range" min="4" max="128" step="4" value={loraRank} onChange={e => setLoraRank(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Target Layers:</label>
                <div className="btn-group">
                  <button className={`btn-select ${loraTargetAll ? 'selected' : ''}`} onClick={() => setLoraTargetAll(true)}>All Linear Layers</button>
                  <button className={`btn-select ${!loraTargetAll ? 'selected' : ''}`} onClick={() => setLoraTargetAll(false)}>Attention Only (Q, V)</button>
                </div>
              </div>
            </div>

            <div className="tool-results">
              <h3>Parameter & Memory Savings</h3>
              <div className="stat-card">
                <span className="stat-label">Trainable Parameters</span>
                <span className="stat-value text-emerald-400">{trainableMillion.toFixed(2)}M ({baseParamPercent.toFixed(3)}%)</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">LoRA Adam Optimizer Memory</span>
                <span className="stat-value">{adamVramMB.toFixed(1)} MB</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Full Fine-Tuning Optimizer Memory</span>
                <span className="stat-value text-rose-400">{fullFinetuneAdamGB.toFixed(1)} GB</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VECTOR GEOMETRY */}
        {activeTab === 'vector' && (
          <div className="tool-grid">
            <div className="tool-inputs">
              <h3>Vector Coordinates (3D Space)</h3>
              <div className="vector-slider-box">
                <h4>Vector U (Query)</h4>
                {[0, 1, 2].map(idx => (
                  <div key={`v1-${idx}`} className="slider-row">
                    <span>Dim {idx + 1}: <strong>{v1[idx].toFixed(2)}</strong></span>
                    <input type="range" min="-1" max="1" step="0.05" value={v1[idx]} onChange={e => {
                      const next = [...v1] as [number, number, number];
                      next[idx] = parseFloat(e.target.value);
                      setV1(next);
                    }} />
                  </div>
                ))}
              </div>
              <div className="vector-slider-box">
                <h4>Vector V (Document)</h4>
                {[0, 1, 2].map(idx => (
                  <div key={`v2-${idx}`} className="slider-row">
                    <span>Dim {idx + 1}: <strong>{v2[idx].toFixed(2)}</strong></span>
                    <input type="range" min="-1" max="1" step="0.05" value={v2[idx]} onChange={e => {
                      const next = [...v2] as [number, number, number];
                      next[idx] = parseFloat(e.target.value);
                      setV2(next);
                    }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="tool-results">
              <h3>Similarity Metrics</h3>
              <div className="stat-card highlight">
                <span className="stat-label">Cosine Similarity</span>
                <span className="stat-value total">{cosineSim.toFixed(4)}</span>
                <span className="stat-note">{cosineSim > 0.8 ? "🟢 Closely Aligned" : cosineSim > 0.3 ? "🟡 Moderate" : "🔴 Divergent"}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Dot Product</span>
                <span className="stat-value">{dot.toFixed(4)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Euclidean Distance (L2)</span>
                <span className="stat-value">{euclideanDist.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REACT STEPPER */}
        {activeTab === 'react-loop' && (
          <div className="react-stepper-view">
            <div className="stepper-controls">
              <span className="text-sm font-semibold">Step: {reactStep + 1} of {reactTrace.length}</span>
              <div className="flex gap-2">
                <button className="btn-select" disabled={reactStep === 0} onClick={() => setReactStep(s => Math.max(0, s - 1))}>Previous</button>
                <button className="btn-select primary" disabled={reactStep === reactTrace.length - 1} onClick={() => setReactStep(s => Math.min(reactTrace.length - 1, s + 1))}>Next Step <Play size={14} /></button>
                <button className="btn-select" onClick={() => setReactStep(0)}><RefreshCw size={14} /></button>
              </div>
            </div>
            <div className="timeline-container">
              {reactTrace.map((item, idx) => (
                <div key={idx} className={`timeline-item ${idx === reactStep ? 'current' : ''} ${idx < reactStep ? 'past' : ''}`} onClick={() => setReactStep(idx)}>
                  <div className="timeline-marker">{idx < reactStep ? <CheckCircle2 size={16} className="text-emerald-400" /> : idx + 1}</div>
                  <div className="timeline-body">
                    <span className={`badge-type ${item.type}`}>{item.label}</span>
                    <p className="timeline-text">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RRF HYBRID FUSION VISUALIZER */}
        {activeTab === 'rrf-fusion' && (
          <div className="tool-grid">
            <div className="tool-inputs">
              <h3>Hybrid Retrieval Ranks & Weights</h3>
              <div className="input-group">
                <label>BM25 Lexical Rank (1 = Top Match): <strong>Rank #{bm25Rank}</strong></label>
                <input type="range" min="1" max="20" step="1" value={bm25Rank} onChange={e => setBm25Rank(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Dense Vector Rank (1 = Top Match): <strong>Rank #{denseRank}</strong></label>
                <input type="range" min="1" max="20" step="1" value={denseRank} onChange={e => setDenseRank(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>RRF Smoothing Constant (k): <strong>k = {rrfK}</strong></label>
                <input type="range" min="10" max="100" step="10" value={rrfK} onChange={e => setRrfK(Number(e.target.value))} />
                <span className="text-xs text-muted">Standard industry constant k=60 prevents low ranks from dominating.</span>
              </div>
              <div className="input-group">
                <label>BM25 Weight: <strong>{bm25Weight.toFixed(1)}x</strong></label>
                <input type="range" min="0.5" max="3.0" step="0.1" value={bm25Weight} onChange={e => setBm25Weight(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Dense Vector Weight: <strong>{denseWeight.toFixed(1)}x</strong></label>
                <input type="range" min="0.5" max="3.0" step="0.1" value={denseWeight} onChange={e => setDenseWeight(Number(e.target.value))} />
              </div>
            </div>

            <div className="tool-results">
              <h3>Reciprocal Rank Fusion Score: RRF = Σ 1 / (k + rank)</h3>
              <div className="stat-card highlight">
                <span className="stat-label">Combined RRF Score</span>
                <span className="stat-value total">{totalRrfScore.toFixed(5)}</span>
                <span className="stat-note">Harmonic fusion across sparse keyword and dense semantic pipelines</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">BM25 Contribution</span>
                <span className="stat-value text-blue-400">{bm25ScorePart.toFixed(5)} ({Math.round((bm25ScorePart/totalRrfScore)*100)}%)</span>
                <span className="stat-note">Score = {bm25Weight} / ({rrfK} + {bm25Rank})</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Dense Vector Contribution</span>
                <span className="stat-value text-purple-400">{denseScorePart.toFixed(5)} ({Math.round((denseScorePart/totalRrfScore)*100)}%)</span>
                <span className="stat-note">Score = {denseWeight} / ({rrfK} + {denseRank})</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CONTEXT COMPACTION INSPECTOR */}
        {activeTab === 'context-compaction' && (
          <div className="tool-grid">
            <div className="tool-inputs">
              <h3>Context Allocation & Compactor Toggle</h3>
              <div className="input-group">
                <label>Context Window Ceiling: <strong>{maxWindow.toLocaleString()} tokens</strong></label>
                <div className="btn-group">
                  {[8192, 16384, 32768, 65536].map(w => (
                    <button key={w} className={`btn-select ${maxWindow === w ? 'selected' : ''}`} onClick={() => setMaxWindow(w)}>
                      {w / 1024}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>System Prompt Base: <strong>{systemPromptTokens.toLocaleString()} tokens</strong></label>
                <input type="range" min="500" max="5000" step="250" value={systemPromptTokens} onChange={e => setSystemPromptTokens(Number(e.target.value))} />
              </div>

              <div className="input-group">
                <label>Pinned Long-Term / Episodic Memory: <strong>{pinnedMemoryTokens.toLocaleString()} tokens</strong></label>
                <input type="range" min="500" max="8000" step="500" value={pinnedMemoryTokens} onChange={e => setPinnedMemoryTokens(Number(e.target.value))} />
              </div>

              <div className="input-group">
                <label>Raw Tool Outputs: <strong>{toolPayloadTokens.toLocaleString()} tokens</strong></label>
                <input type="range" min="1000" max="30000" step="1000" value={toolPayloadTokens} onChange={e => setToolPayloadTokens(Number(e.target.value))} />
              </div>

              <div className="input-group">
                <label>User Conversation Turns: <strong>{userTurnsTokens.toLocaleString()} tokens</strong></label>
                <input type="range" min="1000" max="20000" step="1000" value={userTurnsTokens} onChange={e => setUserTurnsTokens(Number(e.target.value))} />
              </div>

              <div className="compactor-action mt-2">
                <button
                  className={`btn-select primary w-full ${isCompacted ? 'bg-emerald-600' : ''}`}
                  onClick={() => setIsCompacted(!isCompacted)}
                >
                  {isCompacted ? '✓ Compaction Active (Sliding Window & Paged Tool Pruning)' : 'Trigger Context Compaction & Paging'}
                </button>
              </div>
            </div>

            <div className="tool-results">
              <h3>Context Memory & Prefix Cache Utilization</h3>
              <div className="stat-card highlight">
                <span className="stat-label">Total Occupied Tokens</span>
                <span className="stat-value total">{totalOccupiedTokens.toLocaleString()} / {maxWindow.toLocaleString()}</span>
                <div className="progress-track mt-2">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${occupancyPercent}%`,
                      background: occupancyPercent > 90 ? '#ef4444' : occupancyPercent > 70 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
                <span className="stat-note mt-1">Context Window Occupancy: {occupancyPercent.toFixed(1)}%</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Estimated Provider KV-Cache Hit Ratio</span>
                <span className="stat-value text-emerald-400">{kvCachePrefixHitRate}%</span>
                <span className="stat-note">
                  {isCompacted ? "Compacted static invariants maximize prefix caching across turns." : "Rapidly fluctuating history breaks KV-cache prefix hits."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: FDE UNIT ECONOMICS & CASCADE CALCULATOR */}
        {activeTab === 'fde-economics' && (
          <div className="tool-grid">
            <div className="tool-inputs">
              <h3>Traffic & Model Routing Mix</h3>
              <div className="input-group">
                <label>Daily Active Users (DAU): <strong>{dailyActiveUsers.toLocaleString()}</strong></label>
                <input type="range" min="1000" max="100000" step="5000" value={dailyActiveUsers} onChange={e => setDailyActiveUsers(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Queries per User / Day: <strong>{queriesPerUserDay}</strong></label>
                <input type="range" min="1" max="20" step="1" value={queriesPerUserDay} onChange={e => setQueriesPerUserDay(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Avg Prompt Tokens: <strong>{avgPromptTok.toLocaleString()}</strong> | Avg Output Tokens: <strong>{avgOutputTok.toLocaleString()}</strong></label>
                <div className="flex gap-2">
                  <input type="range" min="500" max="8000" step="250" value={avgPromptTok} onChange={e => setAvgPromptTok(Number(e.target.value))} title="Prompt Tokens" />
                  <input type="range" min="100" max="2000" step="50" value={avgOutputTok} onChange={e => setAvgOutputTok(Number(e.target.value))} title="Output Tokens" />
                </div>
              </div>
              <div className="input-group">
                <label>Semantic Cache Hit Ratio: <strong>{cacheHitPercent}%</strong></label>
                <input type="range" min="0" max="60" step="5" value={cacheHitPercent} onChange={e => setCacheHitPercent(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Model Cascade: Route to 8B SLM: <strong>{slmRoutePercent}%</strong> (Frontier: {100 - slmRoutePercent}%)</label>
                <input type="range" min="0" max="100" step="5" value={slmRoutePercent} onChange={e => setSlmRoutePercent(Number(e.target.value))} />
                <span className="text-xs text-muted">SLM priced at $0.20/1M tok; Frontier priced at $2.50 in / $10.00 out per 1M.</span>
              </div>
            </div>

            <div className="tool-results">
              <h3>Monthly Financial & SLA Projections</h3>
              <div className="stat-card highlight">
                <span className="stat-label">Total Monthly AI Serving Cost</span>
                <span className="stat-value total">${Math.round(totalAiCostMonth).toLocaleString()}</span>
                <span className="stat-note">Cost per resolution: ${(totalAiCostMonth / monthlyQueries).toFixed(4)} USD</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Monthly Human Labor Savings</span>
                <span className="stat-value text-emerald-400">${Math.round(netLaborSavings).toLocaleString()}</span>
                <span className="stat-note">ROI Multiple: {((monthlyQueries * 0.15 * 4.5) / Math.max(1, totalAiCostMonth)).toFixed(1)}x</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Projected P99 Latency</span>
                <span className="stat-value text-blue-400">{p99LatencySeconds.toFixed(2)}s</span>
                <span className="stat-note">Blended latency across SLM (350ms) and Frontier (2,800ms) models</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
