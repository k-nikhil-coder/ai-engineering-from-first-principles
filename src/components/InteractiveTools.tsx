import React, { useState } from 'react';
import { Calculator, Play, CheckCircle2, RefreshCw } from 'lucide-react';

export const InteractiveTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kv-cache' | 'lora' | 'vector' | 'react-loop'>('kv-cache');

  // KV-Cache State
  const [modelParams, setModelParams] = useState<number>(8); // 8B
  const [precisionBytes, setPrecisionBytes] = useState<number>(2); // 2 bytes (FP16)
  const [contextLength, setContextLength] = useState<number>(8192);
  const [batchSize, setBatchSize] = useState<number>(8);
  const [numLayers] = useState<number>(32);
  const [numHeadsKV] = useState<number>(8); // GQA
  const [headDim] = useState<number>(128);

  // Model Weights VRAM: params (billions) * bytes per param
  const modelVramGB = (modelParams * 1e9 * precisionBytes) / (1024 ** 3);
  // KV-Cache VRAM: 2 (K & V) * layers * kv_heads * head_dim * seq_len * batch_size * bytes
  const kvCacheBytes = 2 * numLayers * numHeadsKV * headDim * contextLength * batchSize * precisionBytes;
  const kvCacheGB = kvCacheBytes / (1024 ** 3);
  const totalVramGB = modelVramGB + kvCacheGB;

  // LoRA State
  const [loraBaseParams, setLoraBaseParams] = useState<number>(8); // 8 Billion
  const [loraRank, setLoraRank] = useState<number>(16);
  const [loraTargetAll, setLoraTargetAll] = useState<boolean>(true);
  
  // Estimate LoRA params
  const layers = 32;
  const hiddenDim = 4096;
  const matricesPerLayer = loraTargetAll ? 7 : 2; // q, k, v, o, gate, up, down vs q, v
  const trainableParams = layers * matricesPerLayer * (2 * hiddenDim * loraRank);
  const trainableMillion = trainableParams / 1e6;
  const baseParamPercent = (trainableParams / (loraBaseParams * 1e9)) * 100;
  // Optimizer memory: Adam is 8 bytes per trainable param (FP32 momentum + variance)
  const adamVramMB = (trainableParams * 8) / (1024 ** 2);
  const fullFinetuneAdamGB = (loraBaseParams * 1e9 * 8) / (1024 ** 3);

  // Vector Sandbox State
  const [v1, setV1] = useState<[number, number, number]>([0.8, 0.4, 0.1]);
  const [v2, setV2] = useState<[number, number, number]>([0.7, 0.5, -0.2]);

  const dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
  const mag1 = Math.sqrt(v1[0]**2 + v1[1]**2 + v1[2]**2);
  const mag2 = Math.sqrt(v2[0]**2 + v2[1]**2 + v2[2]**2);
  const cosineSim = (mag1 > 0 && mag2 > 0) ? dot / (mag1 * mag2) : 0;
  const euclideanDist = Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2 + (v1[2]-v2[2])**2);

  // ReAct Stepper State
  const [reactStep, setReactStep] = useState<number>(0);
  const reactTrace = [
    {
      type: "goal",
      label: "User Goal",
      text: "Investigate why customer 9021 was charged $120 twice and issue a single refund."
    },
    {
      type: "thought",
      label: "Step 1: Thought",
      text: "I need to query the billing transaction history for customer 9021 to inspect duplicate invoice IDs."
    },
    {
      type: "action",
      label: "Step 2: Action",
      text: "CALL TOOL: stripe_query_charges(customer_id='9021', limit=5)"
    },
    {
      type: "observation",
      label: "Step 3: Environment Observation",
      text: "HOST RETURN: [{'id': 'ch_01', 'amount': 120.0, 'time': '10:04:12'}, {'id': 'ch_02', 'amount': 120.0, 'time': '10:04:14'}] (Duplicate charges detected 2 seconds apart)."
    },
    {
      type: "thought",
      label: "Step 4: Thought",
      text: "Charge ch_02 is an exact duplicate. I must refund ch_02 with idempotency key 'refund_9021_ch02' to prevent double refunds."
    },
    {
      type: "action",
      label: "Step 5: Action",
      text: "CALL TOOL: stripe_issue_refund(charge_id='ch_02', reason='duplicate_charge', idempotency_key='refund_9021_ch02')"
    },
    {
      type: "observation",
      label: "Step 6: Environment Observation",
      text: "HOST RETURN: {'status': 'succeeded', 'refund_id': 're_98829', 'amount': 120.0}"
    },
    {
      type: "final",
      label: "Step 7: Final Answer",
      text: "Confirmed duplicate charge ch_02 of $120.00 was issued at 10:04:14. A full refund of $120.00 has been processed successfully (Refund ID: re_98829)."
    }
  ];

  return (
    <div className="interactive-container">
      <div className="interactive-header">
        <div className="flex items-center gap-2">
          <Calculator className="text-emerald-500" size={24} />
          <h2>First-Principles Interactive Simulators</h2>
        </div>
        <p className="text-muted">
          Hands-on mathematical tools to calculate hardware budgets, adapter sizing, vector geometry, and agentic traces.
        </p>

        {/* Tab Switcher */}
        <div className="tab-pill-bar">
          <button
            className={`tab-pill ${activeTab === 'kv-cache' ? 'active' : ''}`}
            onClick={() => setActiveTab('kv-cache')}
          >
            KV-Cache & VRAM Sizer
          </button>
          <button
            className={`tab-pill ${activeTab === 'lora' ? 'active' : ''}`}
            onClick={() => setActiveTab('lora')}
          >
            LoRA & PEFT Math
          </button>
          <button
            className={`tab-pill ${activeTab === 'vector' ? 'active' : ''}`}
            onClick={() => setActiveTab('vector')}
          >
            Vector Geometry Sandbox
          </button>
          <button
            className={`tab-pill ${activeTab === 'react-loop' ? 'active' : ''}`}
            onClick={() => setActiveTab('react-loop')}
          >
            ReAct Agent Loop Stepper
          </button>
        </div>
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
                  <button
                    className={`btn-select ${precisionBytes === 2 ? 'selected' : ''}`}
                    onClick={() => setPrecisionBytes(2)}
                  >
                    FP16 (2 Bytes)
                  </button>
                  <button
                    className={`btn-select ${precisionBytes === 1 ? 'selected' : ''}`}
                    onClick={() => setPrecisionBytes(1)}
                  >
                    INT8 (1 Byte)
                  </button>
                  <button
                    className={`btn-select ${precisionBytes === 0.5 ? 'selected' : ''}`}
                    onClick={() => setPrecisionBytes(0.5)}
                  >
                    INT4 / AWQ (0.5 Byte)
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Context Length per Request: <strong>{contextLength.toLocaleString()} tokens</strong></label>
                <input
                  type="range"
                  min="2048"
                  max="65536"
                  step="2048"
                  value={contextLength}
                  onChange={(e) => setContextLength(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <label>Concurrent Batch Size: <strong>{batchSize} requests</strong></label>
                <input
                  type="range"
                  min="1"
                  max="64"
                  step="1"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="tool-results">
              <h3>VRAM Allocation Breakdown</h3>
              <div className="stat-card">
                <span className="stat-label">Model Weights VRAM</span>
                <span className="stat-value">{modelVramGB.toFixed(1)} GB</span>
                <span className="stat-note">Static footprint in GPU memory</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">KV-Cache VRAM</span>
                <span className="stat-value text-emerald-400">{kvCacheGB.toFixed(1)} GB</span>
                <span className="stat-note">Dynamic memory: scales with Context × Batch Size</span>
              </div>

              <div className="stat-card highlight">
                <span className="stat-label">Total GPU VRAM Required</span>
                <span className="stat-value total">{(totalVramGB * 1.15).toFixed(1)} GB</span>
                <span className="stat-note">Includes 15% safety buffer for CUDA kernels & activations</span>
              </div>

              <div className="hardware-check">
                <h4>Hardware Feasibility:</h4>
                <div className="hw-badge-list">
                  <span className={`hw-badge ${totalVramGB * 1.15 <= 24 ? 'pass' : 'fail'}`}>
                    RTX 4090 / A10G (24 GB): {totalVramGB * 1.15 <= 24 ? '✓ Fits' : '✗ OOM'}
                  </span>
                  <span className={`hw-badge ${totalVramGB * 1.15 <= 80 ? 'pass' : 'fail'}`}>
                    NVIDIA A100 / H100 (80 GB): {totalVramGB * 1.15 <= 80 ? '✓ Fits' : '✗ Multi-GPU required'}
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
                    <button
                      key={p}
                      className={`btn-select ${loraBaseParams === p ? 'selected' : ''}`}
                      onClick={() => setLoraBaseParams(p)}
                    >
                      {p}B
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>LoRA Rank (r): <strong>{loraRank}</strong></label>
                <input
                  type="range"
                  min="4"
                  max="128"
                  step="4"
                  value={loraRank}
                  onChange={(e) => setLoraRank(Number(e.target.value))}
                />
                <span className="text-muted text-xs">Typical sweet spots: r=8 or r=16</span>
              </div>

              <div className="input-group">
                <label>Target Layers:</label>
                <div className="btn-group">
                  <button
                    className={`btn-select ${loraTargetAll ? 'selected' : ''}`}
                    onClick={() => setLoraTargetAll(true)}
                  >
                    All Linear Layers (7 per layer)
                  </button>
                  <button
                    className={`btn-select ${!loraTargetAll ? 'selected' : ''}`}
                    onClick={() => setLoraTargetAll(false)}
                  >
                    Attention Only (Q, V)
                  </button>
                </div>
              </div>
            </div>

            <div className="tool-results">
              <h3>Parameter & Optimizer Comparison</h3>
              <div className="stat-card">
                <span className="stat-label">Trainable LoRA Parameters</span>
                <span className="stat-value text-emerald-400">{trainableMillion.toFixed(2)} Million</span>
                <span className="stat-note">Just {baseParamPercent.toFixed(3)}% of total model size!</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">LoRA Adam Optimizer VRAM</span>
                <span className="stat-value">{adamVramMB.toFixed(1)} MB</span>
                <span className="stat-note">8 bytes per parameter (FP32 momentum + variance)</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Full Fine-Tuning Optimizer VRAM</span>
                <span className="stat-value text-rose-400">{fullFinetuneAdamGB.toFixed(1)} GB</span>
                <span className="stat-note">Requires multi-GPU cluster without LoRA</span>
              </div>

              <div className="hardware-check">
                <p className="text-sm">
                  <strong>First-Principles Insight:</strong> By freezing $W_0$ and training low-rank matrices $A$ and $B$, you eliminate {((1 - adamVramMB / (fullFinetuneAdamGB * 1024)) * 100).toFixed(1)}% of optimizer memory overhead!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VECTOR GEOMETRY */}
        {activeTab === 'vector' && (
          <div className="tool-grid">
            <div className="tool-inputs">
              <h3>Adjust Vector Coordinates (3D Manifold)</h3>
              
              <div className="vector-slider-box">
                <h4>Vector U (Query Embedding)</h4>
                {[0, 1, 2].map(idx => (
                  <div key={`v1-${idx}`} className="slider-row">
                    <span>Dim {idx + 1}: <strong>{v1[idx].toFixed(2)}</strong></span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={v1[idx]}
                      onChange={(e) => {
                        const next = [...v1] as [number, number, number];
                        next[idx] = parseFloat(e.target.value);
                        setV1(next);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="vector-slider-box">
                <h4>Vector V (Document Embedding)</h4>
                {[0, 1, 2].map(idx => (
                  <div key={`v2-${idx}`} className="slider-row">
                    <span>Dim {idx + 1}: <strong>{v2[idx].toFixed(2)}</strong></span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={v2[idx]}
                      onChange={(e) => {
                        const next = [...v2] as [number, number, number];
                        next[idx] = parseFloat(e.target.value);
                        setV2(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="tool-results">
              <h3>Geometric Similarity Metrics</h3>
              <div className="stat-card highlight">
                <span className="stat-label">Cosine Similarity: cos(θ)</span>
                <span className="stat-value total">{cosineSim.toFixed(4)}</span>
                <span className="stat-note">
                  {cosineSim > 0.8 ? "🟢 Highly Semantically Related" : cosineSim > 0.3 ? "🟡 Moderate Similarity" : "🔴 Orthogonal / Unrelated"}
                </span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Raw Dot Product (u · v)</span>
                <span className="stat-value">{dot.toFixed(4)}</span>
                <span className="stat-note">Sensitive to magnitudes (||u||={mag1.toFixed(2)}, ||v||={mag2.toFixed(2)})</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Euclidean Distance (L2)</span>
                <span className="stat-value">{euclideanDist.toFixed(4)}</span>
                <span className="stat-note">Direct geometric spatial separation</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REACT STEPPER */}
        {activeTab === 'react-loop' && (
          <div className="react-stepper-view">
            <div className="stepper-controls">
              <span className="text-sm font-semibold">
                ReAct Step: {reactStep + 1} of {reactTrace.length}
              </span>
              <div className="flex gap-2">
                <button
                  className="btn-select"
                  disabled={reactStep === 0}
                  onClick={() => setReactStep(s => Math.max(0, s - 1))}
                >
                  Previous
                </button>
                <button
                  className="btn-select primary"
                  disabled={reactStep === reactTrace.length - 1}
                  onClick={() => setReactStep(s => Math.min(reactTrace.length - 1, s + 1))}
                >
                  Next Step <Play size={14} />
                </button>
                <button
                  className="btn-select"
                  onClick={() => setReactStep(0)}
                  title="Reset"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            <div className="timeline-container">
              {reactTrace.map((item, idx) => {
                const isCurrent = idx === reactStep;
                const isPast = idx < reactStep;
                return (
                  <div
                    key={idx}
                    className={`timeline-item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}
                    onClick={() => setReactStep(idx)}
                  >
                    <div className="timeline-marker">
                      {isPast ? <CheckCircle2 size={16} className="text-emerald-400" /> : idx + 1}
                    </div>
                    <div className="timeline-body">
                      <div className="timeline-title-bar">
                        <span className={`badge-type ${item.type}`}>{item.label}</span>
                      </div>
                      <p className="timeline-text">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
