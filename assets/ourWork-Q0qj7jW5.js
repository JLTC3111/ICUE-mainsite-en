const i=`<style> 
.legacy-page{
    margin: 0;
    padding: 0 !important; 
    background-color: #ffffff;
    color: #eee;
    font-family: Poppins;
    font-size: 14px;
}
.legacy-page a{
    text-decoration: none;
}
@media (min-width: 1025px) and (max-width: 1366px) {
.legacy-page {
    overflow: hidden;
}
}
@media (max-width: 1024px) {
  .legacy-page{
    overflow: hidden;
    font-size: 11px;
  }
  .work-carousel{
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
}
  .work-carousel .work-list .work-item .work-content{
        width:65%;
        padding:0;
    }
  .work-carousel .work-list .work-item .work-content .work-title{
        font-size: 20px;
        margin:auto;
    }
  .work-carousel .work-list .work-item .work-content .work-topic{
        font-size: 22px;
        margin:8px auto;
    }
  .work-thumbnail {
    position: fixed;
    bottom: 50px;
    left: 50%;
  }
  .work-thumbnail .work-item {
    width: 80px;
    height: 117px;
  }
  .work-thumbnail .work-item .work-content .work-title {
    font-size: 8px;
  }  
  .work-arrows {
    top:72.5%;
  }
}  
</style>

   
    <!--models-->
      <!-- No poster: it used to be ourWork_img1.jpg, the same photo as the first
           carousel slide, so until the GLB finished loading the crane's 600px
           box painted a second, differently-scaled copy of the hero on top of
           the carousel. A transparent poster leaves the slide visible instead. -->
      <model-viewer class="model-crane"
      src="public/models/tower_crane.glb"
      alt="A 3D model of a crane"
      loading="lazy"
      auto-rotate
      camera-controls
      style="width: 100%; height: 600px; --poster-color: transparent; background-color: transparent;">
      </model-viewer>

    <!-- carousel -->
    <div class="work-carousel">
    
        <!-- list item -->
        <div class="work-list">
          <div class="work-item" data-index="0">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img1-768.webp 768w, /public/work/responsive/ourWork_img1-1280.webp 1280w, /public/work/responsive/ourWork_img1-1920.webp 1920w" sizes="100vw">
                  <img src="/public/work/ourWork_img1.jpg" loading="eager" fetchpriority="high" decoding="async" width="6000" height="4000" alt="Evaluation and reports for buildings" data-work-slide-image>
                </picture>
                <div class="work-content">
                    <div class="work-author">Our Scope of Work</div>
                    <div class="work-title">EVALUATION & REPORTS</div>
                    <div class="work-topic">BUILDINGS</div>
                    <div class="work-des">
                        Design and evaluation of data networks for reliable digital infrastructure. Reports that synthesize data, identify deficiencies, and provide solutions.
                    </div>
                    <div class="work-buttons">
                        <button onclick="window.open('https://contract.icue.vn', '_blank')">SEE MORE</button>
                    </div>
                </div>
            </div>
            <div class="work-item" data-index="1">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img2-768.webp 768w, /public/work/responsive/ourWork_img2-1280.webp 1280w, /public/work/responsive/ourWork_img2-1920.webp 1920w" sizes="100vw">
                  <img src="/public/work/ourWork_img2.jpg" loading="lazy" fetchpriority="low" decoding="async" width="4802" height="3201" alt="Quantity surveying and structural engineering" data-work-slide-image>
                </picture>
                <div class="work-content">
                    <div class="work-author">Our Scope of Work</div>
                    <div class="work-title">QUANTITY SURVEYING</div>
                    <div class="work-topic">STRUCTURAL ENGINEERING</div>
                    <div class="work-des">
                        We deliver specialized services to support the development, evaluation, and implementation of infrastructure and building projects from QS to drawing with BIM. Design and evaluation of data networks for reliable digital infrastructure. Reports that synthesize data, identify deficiencies, and provide solutions.
                        Get in touch with our team to assess your project and provide a tailored solution.
                    </div>
                    <div class="work-buttons">
                        <button onclick="window.open('https://contract.icue.vn', '_blank')">SEE MORE</button>
                    </div>
                </div>
            </div>
            <div class="work-item" data-index="2">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img3-768.webp 768w, /public/work/responsive/ourWork_img3-1280.webp 1280w, /public/work/responsive/ourWork_img3-1920.webp 1920w" sizes="100vw">
                  <img src="/public/work/ourWork_img3.jpg" loading="lazy" fetchpriority="low" decoding="async" width="4000" height="6000" alt="Infrastructure gap analysis and project management" data-work-slide-image>
                </picture>
                <div class="work-content">
                    <div class="work-author">Our Scope of Work</div>
                    <div class="work-title">INFRASTRUCTURE GAP ANALYSIS</div>
                    <div class="work-topic">PROJECT MANAGEMENT</div>
                    <div class="work-des">
                        Precise cost estimation and budget control from project planning to completion.Structural integrity analysis of existing infrastructure in line with standards.
                        Assessment of current structures against national and global benchmarks. Detailed engineering and architectural plans for planning and execution.
                    </div>
                    <div class="work-buttons">
                        <button onclick="window.open('https://contract.icue.vn', '_blank')">SEE MORE</button>
                    </div>
                </div>
            </div>
            <div class="work-item" data-index="3">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img4-768.webp 768w, /public/work/responsive/ourWork_img4-892.webp 892w" sizes="100vw">
                  <img src="/public/work/ourWork_img4.jpg" loading="lazy" fetchpriority="low" decoding="async" width="892" height="1240" alt="Aerial photography and architectural engineering" data-work-slide-image>
                </picture>
                <div class="work-content">
                    <div class="work-author">Our Scope of Work</div>
                    <div class="work-title">AERIAL PHOTOGRAPHY</div>
                    <div class="work-topic">ARCHITECTURAL ENGINEERING</div>
                    <div class="work-des">
                        Aerial Photography-Drone-based imagery and mapping for land assessment and monitoring. Infrastructure Gap Analysis-Identification of missing infrastructure and future development needs.
                    </div>
                    <div class="work-buttons">
                        <button onclick="window.open('https://contract.icue.vn', '_blank')">SEE MORE</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- list thumnail -->
        <div class="work-thumbnail">
            <div class="work-item" data-index="0">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img1-thumb-160.webp 160w, /public/work/responsive/ourWork_img1-thumb-260.webp 260w" sizes="(max-width: 1024px) 80px, 130px">
                  <img src="/public/work/ourWork_img1.jpg" loading="lazy" fetchpriority="low" decoding="async" width="260" height="380" alt="" aria-hidden="true">
                </picture>
                <div class="work-content">
                    <div class="work-title">
                        EVALUATION of BUILDINGS
                    </div>
                    <div class="work-description">
                        
                    </div>
                </div>
            </div>
            <div class="work-item" data-index="1">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img2-thumb-160.webp 160w, /public/work/responsive/ourWork_img2-thumb-260.webp 260w" sizes="(max-width: 1024px) 80px, 130px">
                  <img src="/public/work/ourWork_img2.jpg" loading="lazy" fetchpriority="low" decoding="async" width="260" height="380" alt="" aria-hidden="true">
                </picture>
                <div class="work-content">
                    <div class="work-title">
                        QUANTITY SURVEYING
                    </div>
                    <div class="work-description">
                        
                    </div>
                </div>
            </div>
            <div class="work-item" data-index="2">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img3-thumb-160.webp 160w, /public/work/responsive/ourWork_img3-thumb-260.webp 260w" sizes="(max-width: 1024px) 80px, 130px">
                  <img src="/public/work/ourWork_img3.jpg" loading="lazy" fetchpriority="low" decoding="async" width="260" height="380" alt="" aria-hidden="true">
                </picture>
                <div class="work-content">
                    <div class="work-title">
                        PROJECT MANAGEMENT
                    </div>
                    <div class="work-description">
                        
                    </div>
                </div>
            </div>
            <div class="work-item" data-index="3">
                <picture>
                  <source type="image/webp" srcset="/public/work/responsive/ourWork_img4-thumb-160.webp 160w, /public/work/responsive/ourWork_img4-thumb-260.webp 260w" sizes="(max-width: 1024px) 80px, 130px">
                  <img src="/public/work/ourWork_img4.jpg" loading="lazy" fetchpriority="low" decoding="async" width="260" height="380" alt="" aria-hidden="true">
                </picture>
                <div class="work-content">
                    <div class="work-title">
                        AERIAL PHOTOGRAPHY
                    </div>
                    <div class="work-description">
                        
                    </div>
                </div>
            </div>
        </div>
        <!-- next prev -->
        <div class="work-arrows">
            <button id="work-prev"><svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 14L3 7.5L10 1" stroke="#000000" stroke-linecap="square"/>
            </svg></button>
            <button id="work-next"><svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 14L12 7.5L5 1" stroke="#000000" stroke-linecap="square"/>
            </svg></button>
        </div>
        <!-- time running -->
        <div class="work-time"></div>
    </div>
`;export{i as default};
